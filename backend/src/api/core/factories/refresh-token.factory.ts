import Dayjs from 'dayjs';
import { randomBytes } from 'crypto';
import { User, RefreshToken } from '@prisma/client';
import { REFRESH_TOKEN } from '@config/environment.config';
import { Prisma } from '@services/prisma.service';
import { UserResponseDto } from "@dtos/user.dto";

/**
 * @description Factory class to create refresh tokens
 */
export class RefreshTokenFactory {
  /**
   * @description Generate and store a refresh token for the given user
   * @param user - The user to associate the refresh token with
   */
  static async get(user: UserResponseDto): Promise<RefreshToken> {
    const token = `${user.id}.${randomBytes(40).toString('hex')}`;
    const expires = Dayjs()
      .add(REFRESH_TOKEN.DURATION, REFRESH_TOKEN.UNIT)
      .toDate();

    return await Prisma.client.refreshToken.create({
      data: {
        token,
        userId: user.id,
        expires,
        // user: {
        //   connect: { id: user.id },
        // },
      },
      // include: {
      //   user: true,
      // },
    });
  }
}
