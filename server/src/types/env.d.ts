// src/env.d.ts
declare namespace NodeJS {
    interface ProcessEnv {
      JWT_SECRET: string;
      DOCKER_MONGODB_URI: string;
      //STRIPE_SECRET_KEY: string;
      AWS_S3_REGION: string;
      AWS_S3_ACCESS_KEY_ID: string;
      AWS_S3_ACCESS_SECRET_ACCESS_KEY: string
    }
}
 