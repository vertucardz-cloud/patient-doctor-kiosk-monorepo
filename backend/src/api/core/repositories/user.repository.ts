import { Prisma } from '@services/prisma.service';
import { User, STATUS, PrismaClient } from '@prisma/client';
import { badRequest, notFound, unauthorized } from '@hapi/boom';
import { ACCESS_TOKEN } from '@config/environment.config';
import { UserCreateDto, toUserResponseDto, UserResponseDto } from "@dtos/user.dto";
import {generateApiKey} from '@utils/string.util';
import Dayjs from 'dayjs';
import * as Jwt from 'jwt-simple';
import * as Bcrypt from 'bcrypt';
import { omitBy, isNil } from 'lodash';
import {
  IRegistrable,
  ITokenOptions,
  // IUserQueryString
} from '@interfaces';
import { badImplementation } from '@hapi/boom';

interface IUserQueryString {
  page?: number;
  perPage?: number;
  username?: string;
  email?: string;
  role?: string;
  status?: STATUS;
}

type PrismaTypes = typeof Prisma.client;

class UserRepository {
  private prisma = Prisma.client;

  async create(data: User): Promise<UserResponseDto> {
    try {
      data.deletedAt = null;
      data.updatedAt = new Date();
      data.createdAt = new Date();
      data.apikey = generateApiKey();
      const user= await this.prisma.user.create({ data: data as any });
      return  toUserResponseDto(user);

    } catch (error) {
      throw new Error(`User create failed: ${error}`);
    }
  }

  async insert(user: User): Promise<UserResponseDto> {
    try {
      const userData = await this.prisma.user.create({ data: user });
      return toUserResponseDto(userData);
    } catch (error) {
      throw new Error(`User insert failed: ${error}`);
    }
  }

  async findById(id: string | undefined): Promise<UserResponseDto | null> {
    try {
      if (!id) throw new Error('User Id is not valid.');
      const userData = await this.prisma.user.findUnique({ where: { id } });
      return userData? toUserResponseDto(userData): null;
    } catch (error) {
      throw new Error(`User findById failed: ${error}`);
    }
  }

  async update(id: string, data: Partial<User>): Promise<UserResponseDto> {
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: data as any,
      });

      return toUserResponseDto(updatedUser);
    } catch (error) {
      throw new Error(`User update failed: ${error}`);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.user.delete({ where: { id } });
    } catch (error) {
      throw new Error(`User delete failed: ${error}`);
    }
  }

  async paginate(page: number, perPage: number): Promise<{ users: UserResponseDto[]; total: number }> {
    try {
      const [total, users] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.user.findMany({
          skip: (page - 1) * perPage,
          take: perPage,
          orderBy: { createdAt: 'desc' },
        }),
      ]);
      const fetchedUsers = users.map(toUserResponseDto);
      return { users: fetchedUsers, total };
    } catch (error) {
      throw new Error(`User paginate failed: ${error}`);
    }
  }

  async findAll(): Promise<User[]> {
    try {
      return await this.prisma.user.findMany();
    } catch (error) {
      throw new Error(`User findAll failed: ${error}`);
    }
  }

  async findByEmail(email: string): Promise<UserResponseDto | null> {
    try {
      const user= await this.prisma.user.findUnique({ where: { email } }) as User;
      return toUserResponseDto(user);
    } catch (error) {
      throw new Error(`User findByEmail failed: ${error}`);
    }
  }

  async count(): Promise<number> {
    try {
      return await this.prisma.user.count();
    } catch (error) {
      throw new Error(`User count failed: ${error}`);
    }
  }

  /**
   * @description Get one user
   * @param id - The id of user
   */
  async one(id: string): Promise<UserResponseDto> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw notFound('User not found');
      }

      return toUserResponseDto(user);
    } catch (error) {
      throw new Error(`User find one failed: ${error}`);
    }
  }

  /**
   * @description Get a list of users according to current query parameters
   */
  async list({
    page = 1,
    perPage = 30,
    username,
    email,
    role,
    status,
  }: IUserQueryString): Promise<{ result: UserResponseDto[]; total: number }> {
    try {
      const options = omitBy({ username, email, role, status }, isNil) as IUserQueryString;

      if (page < 1) {
        throw badRequest('Page must be greater than 0');
      }
      if (perPage < 1) {
        throw badRequest('Per page must be greater than 0');
      }

      const filter: Record<string, any> = {
        ...(options.username && { username: { equals: options.username } }),
        ...(options.email && { email: { equals: options.email } }),
        ...(options.role && { role: { equals: options.role } }),
        ...(options.status && { status: { equals: options.status } }),
      };
      const [result, total] = await Promise.all([
        this.prisma.user.findMany({
          where: filter,
          skip: (page - 1) * perPage,
          take: perPage,
          include: { medias: true },
        }),
        this.prisma.user.count({ where: filter }),
      ]);
      const fetchedUsers = result.map(toUserResponseDto);
      return { result: fetchedUsers, total };
    } catch (error) {
      throw new Error(`User list failed: ${error}`);
    }
  }

  /**
   * @description Find user by email and try to generate a JWT token
   * @param options Payload data
   */
  async findAndGenerateToken(options: ITokenOptions): Promise<{ user: User; accessToken: string }> {
    try {
      const { email, password, refreshToken, apikey } = options;
      if (!email && !apikey) {
        throw badRequest('An email or an API key is required to generate a token');
      }
      const user = await this.prisma.user.findUnique({
        where: email ? { email } : { apikey },
      });
      if (!user) {
        throw notFound('User not found');
      } else if (password && (await this.passwordMatches(user.email, password)) === false) {
        throw unauthorized('Password must match to authorize a token generating');
      } else if (
        refreshToken &&
        // refreshToken.user.email === email && // TODO: Check if this is needed
        Dayjs(refreshToken.expires).isBefore(Dayjs())
      ) {
        throw unauthorized('Invalid refresh token');
      }

      return { user, accessToken: await this.token(user.id) };
    } catch (error) {
      throw new Error(`Token generation failed: ${error}`);
    }
  }

  /**
   * @description Create / save user for oauth connection
   * @param options
   * @note User should always be retrieved by email to avoid username collisions
   */
  async oAuthLogin(options: IRegistrable): Promise<UserResponseDto> {
    try {
      const { email, username, password } = options;

      let user = await this.prisma.user.findFirst({
        where: {
          OR: [{ email }, { username }],
        },
      });

      if (user) {
        const updates: Partial<User> = {};

        if (!user.username) {
          updates.username = username;
        }

        if (user.email.includes('externalprovider') && !email.includes('externalprovider')) {
          updates.email = email;
        }

        if (Object.keys(updates).length > 0) {
          user = await this.prisma.user.update({
            where: { id: user.id },
            data: updates,
          });
        }

        return user;
      }

      const fetchedUser =await this.prisma.user.create({
        data: { email, password, username } as any,
      });

      return toUserResponseDto(fetchedUser);
    } catch (error) {
      throw new Error(`OAuth login failed: ${error}`);
    }
  }

  async hashPassword(password: string): Promise<string> {
    try {
      const hashedPassword = await Bcrypt.hash(password, 10);
      return hashedPassword;
    } catch (error) {
      throw badImplementation();
    }
  }

  /**
   * @description Check that password matches
   *
   * @param password
   */
  async passwordMatches(email: string, password: string): Promise<boolean> {
    try {
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (!user || !user.password || typeof user.password !== 'string') {
        return false;
      }
      const match = await Bcrypt.compare(password, user.password);
      return match;
    } catch (err) {
      return false;
    }
  }

  /**
   * @description Generate JWT access token
   */
  async token(id: string | number, duration: number | null = null): Promise<string> {
    const payload = {
      exp: Dayjs()
        .add(duration || ACCESS_TOKEN.DURATION, 'minutes')
        .unix(),
      iat: Dayjs().unix(),
      sub: id,
    };
    return Jwt.encode(payload, ACCESS_TOKEN.SECRET);
  }
}

const userRepository = new UserRepository();
export { userRepository as UserRepository };
