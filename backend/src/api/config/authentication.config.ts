import passport from 'passport';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GithubStrategy } from 'passport-github2';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import { RequestHandler } from 'express';

import { ACCESS_TOKEN, FACEBOOK, GOOGLE, GITHUB, LINKEDIN } from '@config/environment.config';
import { AuthService } from '@services/auth.service';

interface JwtOptions {
  secretOrKey: string;
  jwtFromRequest: ReturnType<typeof ExtractJwt.fromAuthHeaderWithScheme>;
}

/**
 * Authentication configuration
 */
class Authentication {
  private static instance: Authentication;
  private strategies: Record<string, passport.Strategy>;
  private options: {
    jwt: JwtOptions;
  };

  private constructor() {
    // this.options = {
    //   jwt: {
    //     secretOrKey: ACCESS_TOKEN.SECRET,
    //     jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
    //   },
    // };

    this.options = {
      jwt: {
        secretOrKey: ACCESS_TOKEN.SECRET,
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      },
    };
    this.strategies = {};
  }

  static get(): Authentication {
    if (!Authentication.instance) {
      Authentication.instance = new Authentication();
    }
    return Authentication.instance;
  }

  initialize(): any {
    return passport.initialize() as unknown;
  }

  plug(): void {
    this.strategies.jwt = new JwtStrategy(this.options.jwt, AuthService.jwt);

    const activeProviders = [
      { key: 'facebook', config: FACEBOOK },
      { key: 'google', config: GOOGLE },
      { key: 'github', config: GITHUB },
      { key: 'linkedin', config: LINKEDIN },
    ].filter((provider) => provider.config.IS_ACTIVE);

    activeProviders.forEach((provider) => {
      switch (provider.key) {
        case 'facebook':
          //   this.strategies.facebook = new FacebookStrategy(
          //     {
          //       clientID: provider.config.ID,
          //       clientSecret: provider.config.SECRET,
          //       callbackURL: provider.config.CALLBACK_URL,
          //       profileFields: [
          //         'id',
          //         'link',
          //         'email',
          //         'name',
          //         'picture',
          //         'address',
          //       ],
          //     },
          //     AuthService.oAuth
          //   );
          break;
        case 'google':
          //   this.strategies.google = new GoogleStrategy(
          //     {
          //       clientID: provider.config.ID,
          //       clientSecret: provider.config.SECRET,
          //       callbackURL: provider.config.CALLBACK_URL,
          //       scope: ['profile', 'email'],
          //     },
          //     AuthService.oAuth
          //   );
          break;
        case 'github':
        // this.strategies.github = new GithubStrategy(
        //   {
        //     clientID: provider.config.ID,
        //     clientSecret: provider.config.SECRET,
        //     callbackURL: provider.config.CALLBACK_URL,
        //     scope: ['profile', 'email'],
        //   },
        //   AuthService.oAuth
        // );
        // break;
        case 'linkedin':
          //   this.strategies.linkedin = new LinkedInStrategy(
          //     {
          //       clientID: provider.config.ID,
          //       clientSecret: provider.config.SECRET,
          //       callbackURL: provider.config.CALLBACK_URL,
          //       scope: ['profile', 'email'],
          //     },
          //     AuthService.oAuth
          //   );
          break;
      }
    });

    Object.values(this.strategies).forEach((strategy) => {
      passport.use(strategy);
    });
  }
}

const instance = Authentication.get();
export { instance as Authentication };
