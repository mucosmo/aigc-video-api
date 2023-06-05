import { MidwayConfig } from '@midwayjs/core';

export default {
  // use for cookie sign key, should change to your own and keep security
  keys: process.env.COOKIE_KEYS,
  koa: {
    port: process.env.SERVER_PORT || 60150,
  },
  redis: {
    client: {
      port: process.env.REDIS_PORT,
      host: process.env.REDIS_HOST,
      password: process.env.REDIS_PASSWORD,
      db: process.env.REDIS_DB || 0
    },
  },
  midwayLogger: {
    default: {
      maxFiles: '7d',
    }
  }
} as MidwayConfig;
