import { Prisma } from '@services/prisma.service';
import { User, RefreshToken } from '@prisma/client';
import { token } from 'morgan';
import { RefreshTokenFactory } from '@factories/refresh-token.factory';
import { UserResponseDto } from "@dtos/user.dto";

class RefreshTokenRepository {
  private prisma = Prisma.client;

  async generate(user: UserResponseDto): Promise<{ token: string }> {
    try {
      if (!user || !user.id) {
        throw new Error('User is not an instance of User');
      }
      const refreshToken = await RefreshTokenFactory.get(user);
      return refreshToken;
    } catch (error) {
      throw new Error(`Refresh token generation failed: ${error}`);
    }
  }

  async create(userId: string, token: string): Promise<void> {
    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });
  }

  async findByToken(token: string): Promise<{
    token: Partial<RefreshToken>;
    user: User;
  } | null> {
    const refreshToken = await this.prisma.refreshToken.findFirst({
      where: { token },
      include: { user: true },
    });

    return refreshToken
      ? {
          token: {
            id: refreshToken.id,
            token: refreshToken.token,
            userId: refreshToken.userId,
            expires: refreshToken.expires,
          },
          user: refreshToken.user,
        }
      : null;
  }

  async deleteForUser(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  async findTokenById(userId: string): Promise<{ token: string } | null> {
    return await this.prisma.refreshToken.findFirst({
      where: { userId },
    });
  }

  async remove(token: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { token },
    });
  }
}

const refreshTokenRepository = new RefreshTokenRepository();
export { refreshTokenRepository as RefreshTokenRepository };
