import Dayjs from 'dayjs';
import { badData } from '@hapi/boom';

import { ACCESS_TOKEN } from '@config/environment.config';

import { UserRepository } from '@repositories/user.repository';
import { RefreshTokenRepository } from '@repositories/refresh-token.repository';

import { User, RefreshToken } from '@prisma/client';
import { UserCreateDto, toUserResponseDto, UserResponseDto } from "@dtos/user.dto";

import { IOauthResponse } from '@interfaces';

import { hash } from '@utils/string.util';

interface ITokenResponse {
  tokenType: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface IRegistrable {
  id: string | number;
  username: string;
  email: string;
  picture?: string;
  password: string;
}

interface Email {
  value: string;
  verified?: boolean;
}

interface ProfileName {
  givenName?: string;
  familyName?: string;
}

/**
 * @description
 */
class AuthService {
  /**
   * @description
   */
  private static instance: AuthService;

  private constructor() {}

  /**
   * @description
   */
  static get(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * @description Build a token response and return it
   *
   * @param user
   * @param accessToken
   */
  async generateTokenResponse(user: UserResponseDto, accessToken: string): Promise<ITokenResponse | Error> {
    if (!user || !user.id) {
      return badData('User is not an instance of User');
    }
    if (!accessToken) {
      return badData('Access token cannot be retrieved');
    }
    const tokenType = 'Bearer';
    const oldToken = await RefreshTokenRepository.findTokenById(user.id);
    if (oldToken) {
      await RefreshTokenRepository.remove(oldToken.token);
    }
    const refreshToken = await RefreshTokenRepository.generate(user);
    const expiresIn = Dayjs().add(ACCESS_TOKEN.DURATION, 'minutes');
    return {
      tokenType,
      accessToken,
      refreshToken: refreshToken.token,
      expiresIn: (ACCESS_TOKEN.DURATION * 60) as number, // Convert minutes to seconds
    };
  }

  /**
   * @description Revoke a refresh token
   *
   * @param user
   */
  async revokeRefreshToken(user: UserResponseDto): Promise<void | Error> {
    if (!user || !user.id) {
      return badData('User is not an instance of User');
    }

    const oldToken = await RefreshTokenRepository.findTokenById(user.id);

    if (oldToken) {
      await RefreshTokenRepository.remove(oldToken.token);
    }
  }

  /**
   * @description Authentication by oAuth processing
   *
   * @param token Access token of provider
   * @param refreshToken Refresh token of provider
   * @param profile Shared profile information
   * @param next Callback function
   *
   * @async
   */

  async oAuth(
    token: string,
    refreshToken: string,
    profile: IOauthResponse,
    next: (e?: Error | null, v?: Partial<User> | boolean) => void
  ): Promise<void> {
    try {
      // Safely extract email with proper null checks
      let email: string;
      if (profile.emails && profile.emails.length > 0) {
        const verifiedEmail = profile.emails.find((mail) => !mail.hasOwnProperty('verified') || mail.verified);
        email =
          verifiedEmail?.value ??
          `${profile.name?.givenName?.toLowerCase() ?? ''}${
            profile.name?.familyName?.toLowerCase() ?? ''
          }@externalprovider.com`;
      } else {
        email = `${profile.name?.givenName?.toLowerCase() ?? ''}${
          profile.name?.familyName?.toLowerCase() ?? ''
        }@externalprovider.com`;
      }

      // Safely extract username
      const username =
        profile.username ??
        `${profile.name?.givenName?.toLowerCase() ?? ''}${profile.name?.familyName?.toLowerCase() ?? ''}`;

      // Safely extract photo
      const picture = profile.photos?.[0]?.value;

      const iRegistrable: IRegistrable = {
        id: profile.id,
        username,
        email,
        picture,
        password: hash(email, 16),
      };

      const user = await UserRepository.oAuthLogin(iRegistrable);
      return next(null, user);
    } catch (err) {
      return next(err instanceof Error ? err : new Error('Authentication failed'), false);
    }
  }

  /**
   * @description Authentication by JWT middleware function
   *
   * @async
   */
  async jwt(payload: { sub: string }, next: (e?: Error | null, v?: Partial<User> | boolean) => void): Promise<void> {
    try {
      const userId = payload.sub;

      const user = await UserRepository.one(userId);
      if (!user) {
        return next(null, false);
      }

      return next(null, user);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Authentication failed');
      return next(error, false);
    }
  }
}

const authService = AuthService.get();

export { authService as AuthService };
