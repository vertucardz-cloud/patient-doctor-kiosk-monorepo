import { existsSync, mkdirSync } from 'fs';
import { config as Dotenv } from 'dotenv';
import { join } from 'path';

import {
  DatabaseEngine,
  MomentUnit,
  EnvAccessToken,
  EnvOauth,
  EnvMemoryCache,
  EnvSSL,
  EnvTypeorm,
  EnvLog,
  EnvUpload,
  EnvImageScaling,
  EnvRefreshToken,
  EnvWhatsapp,
} from '@types';
import {
  DATABASE_ENGINE,
  ENVIRONMENT,
  ARCHIVE_MIME_TYPE,
  AUDIO_MIME_TYPE,
  DOCUMENT_MIME_TYPE,
  IMAGE_MIME_TYPE,
  VIDEO_MIME_TYPE,
  CONTENT_TYPE as CONTENT_TYPE_ENUM,
} from '@enums';
import { list } from '@utils/enum.util';

interface EnvironmentCluster {
  ACCESS_TOKEN: EnvAccessToken;
  API_VERSION: string;
  AUTHORIZED: string;
  CDN: string | null;
  CONTENT_TYPE: string;
  DOMAIN: string;
  ENV: ENVIRONMENT;
  FACEBOOK: EnvOauth;
  GITHUB: EnvOauth;
  GOOGLE: EnvOauth;
  LINKEDIN: EnvOauth;
  LOGS: EnvLog;
  MEMORY_CACHE: EnvMemoryCache;
  PORT: number;
  REFRESH_TOKEN: EnvRefreshToken;
  SCALING: EnvImageScaling;
  SSL: EnvSSL;
  UPLOAD: EnvUpload;
  URL: string;
  FRONTEND_BASE_URL: string;
  TEMPLATE_IMAGE_URL: string;
  WHATS_APP: EnvWhatsapp;
}

interface ValidationRules {
  [key: string]: (value: string) => any;
}

/**
 * Environment configuration loader and validator
 */
export class Environment {
  private static instance: Environment;
  base = 'dist';
  cluster!: EnvironmentCluster | Record<string, any>;
  environment: ENVIRONMENT = ENVIRONMENT.development;
  errors: string[] = [];
  variables: Record<string, unknown> = {};
  private readonly dirs = ['archives', 'documents', 'images/master-copy', 'images/rescale', 'audios', 'videos'];

  private constructor() { }

  static get(): Environment {
    if (!Environment.instance) {
      Environment.instance = new Environment();
    }
    return Environment.instance;
  }

  private get keys(): string[] {
    return [
      'ACCESS_TOKEN_SECRET',
      'ACCESS_TOKEN_DURATION',
      'API_VERSION',
      'AUTHORIZED',
      'CDN',
      'CONTENT_TYPE',
      'DOMAIN',
      'FACEBOOK_CONSUMER_ID',
      'FACEBOOK_CONSUMER_SECRET',
      'GITHUB_CONSUMER_ID',
      'GITHUB_CONSUMER_SECRET',
      'GOOGLE_CONSUMER_ID',
      'GOOGLE_CONSUMER_SECRET',
      'LINKEDIN_CONSUMER_ID',
      'LINKEDIN_CONSUMER_SECRET',
      'LOGS_PATH',
      'LOGS_TOKEN',
      'MEMORY_CACHE',
      'MEMORY_CACHE_DURATION',
      'PORT',
      'REFRESH_TOKEN_DURATION',
      'REFRESH_TOKEN_SECRET',
      'REFRESH_TOKEN_UNIT',
      'RESIZE_IS_ACTIVE',
      'RESIZE_PATH_MASTER',
      'RESIZE_PATH_SCALE',
      'RESIZE_SIZE_LG',
      'RESIZE_SIZE_MD',
      'RESIZE_SIZE_SM',
      'RESIZE_SIZE_XL',
      'RESIZE_SIZE_XS',
      'SSL_CERT',
      'SSL_KEY',
      'UPLOAD_MAX_FILE_SIZE',
      'UPLOAD_MAX_FILES',
      'UPLOAD_PATH',
      'UPLOAD_WILDCARDS',
      'URL',
      'FRONTEND_BASE_URL',
      'TEMPLATE_IMAGE_URL',
      'WHATSAPP_NUMBER',
      'WHATSAPP_API_KEY',
      'WHATSAPP_API_VERSION',
      'WHATSAPP_API_URL',
      'WHATSAPP_API_SECRET',
      'WHATSAPP_ACCESS_TOKEN',
      'WHATSAPP_REFRESH_TOKEN',
    ];
  }

  get rules(): ValidationRules {
    return {
      /**
       * @description Access token secret phrase
       */
      ACCESS_TOKEN_SECRET: (value: string): string | null => {
        if (!value) {
          this.errors.push(
            'ACCESS_TOKEN_SECRET not found: please fill an access token secret value in your .env file to strengthen the encryption.'
          );
        }
        if (value && value.toString().length < 32) {
          this.errors.push(
            'ACCESS_TOKEN_SECRET bad value: please fill an access token secret which have a length >= 32.'
          );
        }
        return value ? value.toString() : null;
      },

      /**
       * @description Access token duration in minutes
       *
       * @default 60
       */
      ACCESS_TOKEN_DURATION: (value: string): number => {
        if (value && isNaN(parseInt(value, 10))) {
          this.errors.push('ACCESS_TOKEN_DURATION bad value: please fill a duration expressed as a number');
        }
        return parseInt(value, 10) || 60;
      },

      /**
       * @description Current api version
       *
       * @default v1
       */
      API_VERSION: (value: string): string => {
        return value ? value.trim().toLowerCase() : 'v1';
      },

      /**
       * @description Authorized remote(s) host(s)
       *
       * @default null
       */
      AUTHORIZED: (value: string): string | null => {
        const regex =
          /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}(:[0-9]{1,5})|\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
        if (!value) {
          this.errors.push(
            'AUTHORIZED not found: please fill a single host as string or multiple hosts separated by coma (ie: http://my-domain.com or http://my-domain-1.com,http://my-domain-2.com, ...'
          );
        }
        if (value && value.lastIndexOf(',') === -1 && !regex.test(value)) {
          this.errors.push(
            'AUTHORIZED bad value: please fill a single host as string or multiple hosts separated by coma (ie: http://my-domain.com or http://my-domain-1.com,http://my-domain-2.com, ...'
          );
        }
        if (value && value.lastIndexOf(',') !== -1 && value.split(',').some((v) => !regex.test(v))) {
          this.errors.push(
            'AUTHORIZED bad value: please fill a single host as string or multiple hosts separated by coma (ie: http://my-domain.com or http://my-domain-1.com,http://my-domain-2.com, ...'
          );
        }
        return value ? value.trim().toLowerCase() : null;
      },

      /**
       * @description Content delivery network location
       *
       * @default null
       */
      CDN: (value: string) => {
        const regex =
          /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}(:[0-9]{1,5})|\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
        if (value && regex.test(value) === false) {
          this.errors.push('CDN bad value: please fill a valid CDN url');
        }
        return value || null;
      },

      /**
       * @description Content-Type
       *
       * @default application/json
       */
      CONTENT_TYPE: (value: string): string => {
        // const contentType = CONTENT_TYPE_ENUM[value];
        // if (value && !contentType) {
        //   this.errors.push(
        //     `CONTENT_TYPE bad value: please fill a supported Content-Type. Must be one of: ${list(CONTENT_TYPE_ENUM).join(', ')}`
        //   );
        // }
        // return contentType || CONTENT_TYPE_ENUM['application/json'];
        return CONTENT_TYPE_ENUM['application/json'];
      },

      /**
       * @description Domain of the application in current environment
       *
       * @default localhost
       */
      DOMAIN: (value: string): string => {
        return value ? value.trim().toLowerCase() : 'localhost';
      },

      /**
       * @description Facebook application id
       *
       * @default null
       */
      FACEBOOK_CONSUMER_ID: (value: string): string | null => {
        if (value && /[0-9]{15}/.test(value) === false) {
          this.errors.push('FACEBOOK_CONSUMER_ID bad value: check your Facebook app settings to fill a correct value.');
        }
        return value || null;
      },

      /**
       * @description Facebook application secret
       *
       * @default null
       */
      FACEBOOK_CONSUMER_SECRET: (value: string): string | null => {
        if (value && /[0-9-abcdef]{32}/.test(value) === false) {
          this.errors.push(
            'FACEBOOK_CONSUMER_SECRET bad value: check your Facebook app settings to fill a correct value.'
          );
        }
        return value || null;
      },

      /**
       * @description Github application id
       *
       * @default null
       */
      GITHUB_CONSUMER_ID: (value: string): string | null => {
        if (value && /[0-9-a-z-A-Z]{20}/.test(value) === false) {
          this.errors.push('GITHUB_CONSUMER_ID bad value: check your Github app settings to fill a correct value.');
        }
        return value || null;
      },

      /**
       * @description Github application secret
       *
       * @default null
       */
      GITHUB_CONSUMER_SECRET: (value: string): string | null => {
        if (value && /[0-9-A-Z-a-z-_]{40}/.test(value) === false) {
          this.errors.push(
            'GITHUB_CONSUMER_SECRET bad value: check your Github app and fill a correct value in your .env file.'
          );
        }
        return value || null;
      },

      /**
       * @description Google application id
       *
       * @default null
       */
      GOOGLE_CONSUMER_ID: (value: string): string | null => {
        if (value && /[0-9]{12}-[0-9-a-z]{32}.apps.googleusercontent.com/.test(value) === false) {
          this.errors.push('GOOGLE_CONSUMER_ID bad value: check your Google app settings to fill a correct value.');
        }
        return value || null;
      },

      /**
       * @description Google application secret
       *
       * @default null
       */
      GOOGLE_CONSUMER_SECRET: (value: string): string | null => {
        if (value && /[0-9-A-Z-a-z-_]{24}/.test(value) === false) {
          this.errors.push(
            'GOOGLE_CONSUMER_SECRET bad value: check your Google app and fill a correct value in your .env file.'
          );
        }
        return value || null;
      },

      /**
       * @description Linkedin application id
       *
       * @default null
       */
      LINKEDIN_CONSUMER_ID: (value: string): string | null => {
        if (value && /[0-9-a-z-A-Z]{20}/.test(value) === false) {
          this.errors.push('LINKEDIN_CONSUMER_ID bad value: check your Linkedin app settings to fill a correct value.');
        }
        return value || null;
      },

      /**
       * @description Linkedin application secret
       *
       * @default null
       */
      LINKEDIN_CONSUMER_SECRET: (value: string): string | null => {
        if (value && /[0-9-A-Z-a-z-_]{40}/.test(value) === false) {
          this.errors.push(
            'LINKEDIN_CONSUMER_SECRET bad value: check your Linkedin app and fill a correct value in your .env file.'
          );
        }
        return value || null;
      },

      /**
       * @description Logs token configuration used by Morgan for output pattern
       *
       * @default dev
       */
      LOGS_TOKEN: (value: string): string => {
        return this.environment === ENVIRONMENT.production ? 'combined' : value || 'dev';
      },

      /**
       * @description Logs path root directory
       *
       * @default logs
       */
      LOGS_PATH: (value: string): string => {
        return `${process.cwd()}/${this.base}/${value || 'logs'}`;
      },

      /**
       * @description Memory cache activated
       *
       * @default false
       */
      MEMORY_CACHE: (value: string): boolean => {
        return !!parseInt(value, 10) || false;
      },

      /**
       * @description Memory cache lifetime duration
       *
       * @default 5000
       */
      MEMORY_CACHE_DURATION: (value: string): number => {
        return parseInt(value, 10) || 5000;
      },

      /**
       * @description Listened port. Default 8101
       *
       * @default 8101
       */
      PORT: (value: string): number => {
        if (value && (isNaN(parseInt(value, 10)) || parseInt(value, 10) > 65535)) {
          this.errors.push('PORT bad value: please fill a valid TCP port number');
        }
        return parseInt(value, 10) || 8101;
      },

      /**
       * @description Refresh token duration
       *
       * @default 30
       */
      REFRESH_TOKEN_DURATION: (value: string): number => {
        if (value && isNaN(parseInt(value, 10))) {
          this.errors.push('REFRESH_TOKEN_DURATION bad value: duration must be a number expressed in minutes.');
        }
        return parseInt(value, 10) || 30;
      },

      /**
       * @description Refresh token secret phrase
       */
      REFRESH_TOKEN_SECRET: (value: string): string | null => {
        if (!value) {
          this.errors.push(
            'REFRESH_TOKEN_SECRET not found: please fill a refresh token secret value in your .env file to strengthen the encryption.'
          );
        }
        if (value && value.toString().length < 32) {
          this.errors.push(
            'REFRESH_TOKEN_SECRET bad value: please fill a refresh token secret which have a length >= 32.'
          );
        }
        return value ? value.toString() : null;
      },

      /**
       * @description Refresh token unit of duration (hours|days|weeks|months)
       *
       * @default 30
       */
      REFRESH_TOKEN_UNIT: (value: string): MomentUnit => {
        if (value && !['hours', 'days', 'weeks', 'months'].includes(value)) {
          this.errors.push('REFRESH_TOKEN_UNIT bad value: unit must be one of hours, days, weeks, months.');
        }
        return (value || 'days') as MomentUnit;
      },

      /**
       * @description Image resizing activated
       *
       * @default true
       */
      RESIZE_IS_ACTIVE: (value: string): boolean => {
        return !!parseInt(value, 10) || true;
      },

      /**
       * @description Directory name for original copy (required)
       *
       * @default master-copy
       */
      RESIZE_PATH_MASTER: (value: string): string => {
        return value || 'master-copy';
      },

      /**
       * @description Directory name for resizes
       *
       * @default rescale
       */
      RESIZE_PATH_SCALE: (value: string): string => {
        return value || 'rescale';
      },

      /**
       * @description
       *
       * @default 1024
       */
      RESIZE_SIZE_LG: (value: string): number => {
        return parseInt(value, 10) || 1024;
      },

      /**
       * @description
       *
       * @default 768
       */
      RESIZE_SIZE_MD: (value: string): number => {
        return parseInt(value, 10) || 768;
      },

      /**
       * @description
       *
       * @default 320
       */
      RESIZE_SIZE_SM: (value: string): number => {
        return parseInt(value, 10) || 320;
      },

      /**
       * @description
       *
       * @default 1366
       */
      RESIZE_SIZE_XL: (value: string): number => {
        return parseInt(value, 10) || 1366;
      },

      /**
       * @description
       *
       * @default 280
       */
      RESIZE_SIZE_XS: (value: string): number => {
        return parseInt(value, 10) || 280;
      },

      /**
       * @description SSL certificate location
       *
       * @default null
       */
      SSL_CERT: (value: string): string | null => {
        if (value && !existsSync(value)) {
          this.errors.push(
            'SSL_CERT bad value or SSL certificate not found. Please check path and/or file access rights.'
          );
        }
        return value || null;
      },

      /**
       * @description SSL key location
       *
       * @default null
       */
      SSL_KEY: (value: string): string | null => {
        if (value && !existsSync(value)) {
          this.errors.push('SSL_KEY bad value or SSL key not found. Please check path and/or file access rights.');
        }
        return value || null;
      },

      /**
       * @description Max upload file size
       *
       * @default 2000000
       */
      UPLOAD_MAX_FILE_SIZE: (value: string): number => {
        if (value && isNaN(parseInt(value, 10))) {
          this.errors.push('UPLOAD_MAX_FILE_SIZE bad value: please fill it with an integer.');
        }
        return parseInt(value, 10) || 2000000;
      },

      /**
       * @description Max number of uploaded files by request
       *
       * @default 5
       */
      UPLOAD_MAX_FILES: (value: string): number => {
        if (value && isNaN(parseInt(value, 10))) {
          this.errors.push('UPLOAD_MAX_FILES bad value: please fill it with an integer.');
        }
        return parseInt(value, 10) || 5;
      },

      /**
       * @description Upload directory path
       *
       * @default public
       */
      UPLOAD_PATH: (value: string): string => {
        return `${process.cwd()}/${this.base}/${value || 'public'}`;
      },

      /**
       * @description Accepted mime-type
       *
       * @default AUDIO|ARCHIVE|DOCUMENT|IMAGE|VIDEO
       */
      UPLOAD_WILDCARDS: (value: string): string[] => {
        // const mimes = {
        //   AUDIO: AUDIO_MIME_TYPE,
        //   ARCHIVE: ARCHIVE_MIME_TYPE,
        //   DOCUMENT: DOCUMENT_MIME_TYPE,
        //   IMAGE: IMAGE_MIME_TYPE,
        //   VIDEO: VIDEO_MIME_TYPE,
        // };
        // const input = value
        //   ? value.split(',').map((v) => v.trim().toUpperCase())
        //   : Object.keys(mimes);
        // const keys = Object.keys(mimes);
        // if (input.some((key) => !keys.includes(key))) {
        //   this.errors.push(
        //     `UPLOAD_WILDCARDS bad value: please fill it with an accepted value (${keys.join(',')}) with comma separation`
        //   );
        // }
        // return input
        //   .filter((key) => !!mimes[key])
        //   .map((key) => mimes[key] as Record<string, string>)
        //   .reduce((acc, current) => [...acc, ...list(current)], [] as string[]);
        return [''];
      },

      /**
       * @description API main URL
       *
       * @default http://localhost:8101
       */
      URL: (value: string): string => {
        const regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}(\.[a-zA-Z0-9()]{1,})?(:[0-9]{1,5})?/;
        if (value && regex.test(value) === false) {
          this.errors.push('URL bad value. Please fill a local or remote URL');
        }
        return value || 'http://localhost:8101';
      },
      FRONTEND_BASE_URL: (value: string): string => {
        const regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}(\.[a-zA-Z0-9()]{1,})?(:[0-9]{1,5})?/;
        if (value && regex.test(value) === false) {
          this.errors.push('FRONTEND BASE URL bad value. Please fill a local or remote FRONTEND BASE URL');
        }
        return value || 'http://localhost:3000';
      },
      TEMPLATE_IMAGE_URL: (value: string): string => {
        const regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}(\.[a-zA-Z0-9()]{1,})?(:[0-9]{1,5})?/;
        if (value && regex.test(value) === false) {
          this.errors.push('TEMPLATE_IMAGE_URL bad value. Please fill a local or remote TEMPLATE_IMAGE_URL');
        }
        return value;
      },

      WHATSAPP_NUMBER: (value: string): string => {
        if (!value || typeof value !== 'string') {
          this.errors.push('WhatsApp number is required and must be a string.');
        }

        const cleaned = value.trim();
        const phoneRegex = /^\d{8,15}$/;
        if (!phoneRegex.test(cleaned)) {
          this.errors.push('Invalid WhatsApp number. Must be 8-15 digits and numeric only.');
        }
        return cleaned;
      },

      WHATSAPP_API_KEY: (value: string) => {
        if (!value || typeof value !== 'string') {
          this.errors.push('WhatsApp API key is required and must be a string.');
        }
        return value;
      },

      WHATSAPP_API_VERSION: (value: string) => {
        if (!value || typeof value !== 'string') {
          this.errors.push('WhatsApp API version is required and must be a string.');
        }
        return value;
      },

      WHATSAPP_API_URL: (value: string) => {
        if (!value || typeof value !== 'string') {
          this.errors.push('WhatsApp API URL is required and must be a string.');
        }
        return value;
      },

      WHATSAPP_API_SECRET: (value: string) => {
        if (!value || typeof value !== 'string') {
          this.errors.push('WhatsApp API secret is required and must be a string.');
        }
        return value;
      },

      WHATSAPP_ACCESS_TOKEN: (value: string) => {
        if (!value || typeof value !== 'string') {
          this.errors.push('WhatsApp access token is required and must be a string.');
        }
        return value;
      },

      WHATSAPP_REFRESH_TOKEN: (value: string) => {
        if (!value || typeof value !== 'string') {
          this.errors.push('WhatsApp refresh token is required and must be a string.');
        }
        return value;
      },
    };
  }

  loads(nodeVersion: string): this {
    const [major, minor] = nodeVersion.split('.').map(Number);
    if (major < 14 || (major === 14 && minor < 16)) {
      this.exit('Node.js v14.16.0 or higher required');
    }

    this.environment = this.determineEnvironment();
    // const envPath = join(process.cwd(), `.env.${this.environment}`); // according mode
    const envPath = join(process.cwd(), '.env');
    if (!existsSync(envPath)) {
      this.exit(`Environment file not found at ${envPath}`);
    }

    Dotenv({ path: envPath });
    return this;
  }

  private determineEnvironment(): ENVIRONMENT {
    if (process.argv.includes('--env')) {
      const env = process.argv[process.argv.indexOf('--env') + 1];
      return ENVIRONMENT[env as keyof typeof ENVIRONMENT] || ENVIRONMENT.development;
    }
    return process.env.NODE_ENV
      ? ENVIRONMENT[process.env.NODE_ENV as keyof typeof ENVIRONMENT]
      : ENVIRONMENT.development;
  }

  extracts(env: NodeJS.ProcessEnv): this {
    this.variables = this.keys.reduce(
      (acc, key) => {
        acc[key] = env[key];
        return acc;
      },
      {} as Record<string, unknown>
    );
    return this;
  }

  validates(): this {
    this.keys.forEach((key) => {
      if (!(key in this.rules)) {
        throw new Error(`Missing validation rule for environment variable: ${key}`);
      }

      const rule = this.rules[key];
      if (typeof rule !== 'function') {
        throw new Error(`Validation rule for ${key} is not a function`);
      }

      try {
        this.variables[key] = rule(this.variables[key] as string);
      } catch (error: any) {
        throw new Error(`Failed to validate ${key}: ${error.message}`);
      }
    });
    return this;
  }

  aggregates(): this {
    this.cluster = {
      ACCESS_TOKEN: {
        SECRET: this.variables.ACCESS_TOKEN_SECRET,
        DURATION: this.variables.ACCESS_TOKEN_DURATION,
      },
      API_VERSION: this.variables.API_VERSION,
      AUTHORIZED: this.variables.AUTHORIZED,
      CDN: this.variables.CDN,
      CONTENT_TYPE: this.variables.CONTENT_TYPE,
      DOMAIN: this.variables.DOMAIN,
      ENV: this.environment,
      FACEBOOK: {
        KEY: 'facebook',
        IS_ACTIVE: this.variables.FACEBOOK_CONSUMER_ID !== null && this.variables.FACEBOOK_CONSUMER_SECRET !== null,
        ID: this.variables.FACEBOOK_CONSUMER_ID,
        SECRET: this.variables.FACEBOOK_CONSUMER_SECRET,
        CALLBACK_URL: `${this.variables.URL as string}/api/${this.variables.API_VERSION as string}/auth/facebook/callback`,
      },
      GITHUB: {
        KEY: 'github',
        IS_ACTIVE: this.variables.GITHUB_CONSUMER_ID !== null && this.variables.GITHUB_CONSUMER_SECRET !== null,
        ID: this.variables.GITHUB_CONSUMER_ID,
        SECRET: this.variables.GITHUB_CONSUMER_SECRET,
        CALLBACK_URL: `${this.variables.URL as string}/api/${this.variables.API_VERSION as string}/auth/github/callback`,
      },
      GOOGLE: {
        KEY: 'google',
        IS_ACTIVE: this.variables.GOOGLE_CONSUMER_ID !== null && this.variables.GOOGLE_CONSUMER_SECRET !== null,
        ID: this.variables.GOOGLE_CONSUMER_ID,
        SECRET: this.variables.GOOGLE_CONSUMER_SECRET,
        CALLBACK_URL: `${this.variables.URL as string}/api/${this.variables.API_VERSION as string}/auth/google/callback`,
      },
      LINKEDIN: {
        KEY: 'linkedin',
        IS_ACTIVE: this.variables.LINKEDIN_CONSUMER_ID !== null && this.variables.LINKEDIN_CONSUMER_SECRET !== null,
        ID: this.variables.LINKEDIN_CONSUMER_ID,
        SECRET: this.variables.LINKEDIN_CONSUMER_SECRET,
        CALLBACK_URL: `${this.variables.URL as string}/api/${this.variables.API_VERSION as string}/auth/linkedin/callback`,
      },
      LOGS: {
        PATH: this.variables.LOGS_PATH,
        TOKEN: this.variables.LOGS_TOKEN,
      },
      MEMORY_CACHE: {
        IS_ACTIVE: this.variables.MEMORY_CACHE,
        DURATION: this.variables.MEMORY_CACHE_DURATION,
      },
      PORT: this.variables.PORT,
      REFRESH_TOKEN: {
        DURATION: this.variables.REFRESH_TOKEN_DURATION,
        SECRET: this.variables.REFRESH_TOKEN_SECRET,
        UNIT: this.variables.REFRESH_TOKEN_UNIT,
      },
      SCALING: {
        IS_ACTIVE: this.variables.RESIZE_IS_ACTIVE,
        PATH_MASTER: this.variables.RESIZE_PATH_MASTER,
        PATH_SCALE: this.variables.RESIZE_PATH_SCALE,
        SIZES: {
          XS: this.variables.RESIZE_SIZE_XS,
          SM: this.variables.RESIZE_SIZE_SM,
          MD: this.variables.RESIZE_SIZE_MD,
          LG: this.variables.RESIZE_SIZE_LG,
          XL: this.variables.RESIZE_SIZE_XL,
        },
      },
      SSL: {
        IS_ACTIVE: this.variables.SSL_CERT !== null && this.variables.SSL_KEY !== null,
        CERT: this.variables.SSL_CERT,
        KEY: this.variables.SSL_KEY,
      },
      UPLOAD: {
        MAX_FILE_SIZE: this.variables.UPLOAD_MAX_FILE_SIZE,
        MAX_FILES: this.variables.UPLOAD_MAX_FILES,
        PATH: this.variables.UPLOAD_PATH,
        WILDCARDS: this.variables.UPLOAD_WILDCARDS,
      },
      URL: this.variables.URL,
      FRONTEND_BASE_URL: this.variables.FRONTEND_BASE_URL,
      TEMPLATE_IMAGE_URL: this.variables.TEMPLATE_IMAGE_URL,
      WHATS_APP: {
        NUMBER: this.variables.WHATSAPP_NUMBER,
        API_KEY: this.variables.WHATSAPP_API_KEY,
        API_VERSION: this.variables.WHATSAPP_API_VERSION,
        API_SECRET: this.variables.WHATSAPP_API_SECRET,
        ACCESS_TOKEN: this.variables.WHATSAPP_ACCESS_TOKEN,
        REFRESH_TOKEN: this.variables.WHATSAPP_REFRESH_TOKEN,
        API_URL: this.variables.WHATSAPP_API_URL,
      },
    };
    return this;
  }

  directories(): this {
    const requiredDirs = [
      this.cluster.LOGS.PATH,
      this.cluster.UPLOAD.PATH,
      ...this.dirs.map((dir) => join(this.cluster.UPLOAD.PATH, dir)),
    ];

    requiredDirs.forEach((dir) => {
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    });

    return this;
  }
  directories1(): this {
    const dirs = ['logs', 'public', 'uploads']; // or however you define them
    dirs.forEach((dir) => {
      const target = this.base ? `${process.cwd()}/${this.base}/${dir}` : undefined;
      if (target) {
        mkdirSync(target, { recursive: true });
      } else {
        this.errors.push(`Failed to resolve path for: ${dir}`);
      }
    });
    return this;
  }

  isValid(): boolean {
    return this.errors.length === 0;
  }

  exit(message: string | string[]): never {
    console.error('\n[ERROR]', ...(Array.isArray(message) ? message : [message]));
    process.exit(1);
  }
}

const environment = Environment.get()
  .loads(process.versions.node)
  .extracts(process.env)
  .validates()
  .aggregates()
  .directories();

if (!environment.isValid()) environment.exit(environment.errors);

const {
  ACCESS_TOKEN,
  API_VERSION,
  AUTHORIZED,
  CDN,
  CONTENT_TYPE,
  DOMAIN,
  ENV,
  FACEBOOK,
  GITHUB,
  GOOGLE,
  LINKEDIN,
  LOGS,
  MEMORY_CACHE,
  PORT,
  REFRESH_TOKEN,
  SCALING,
  SSL,
  UPLOAD,
  URL,
  FRONTEND_BASE_URL,
  TEMPLATE_IMAGE_URL,
  WHATS_APP,
} = environment.cluster;

export {
  ACCESS_TOKEN,
  API_VERSION,
  AUTHORIZED,
  CDN,
  CONTENT_TYPE,
  DOMAIN,
  ENV,
  FACEBOOK,
  GITHUB,
  GOOGLE,
  LINKEDIN,
  LOGS,
  MEMORY_CACHE,
  PORT,
  REFRESH_TOKEN,
  SCALING,
  SSL,
  UPLOAD,
  URL,
  FRONTEND_BASE_URL,
  TEMPLATE_IMAGE_URL,
  WHATS_APP,
};
