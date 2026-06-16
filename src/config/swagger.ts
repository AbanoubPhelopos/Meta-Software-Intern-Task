import swaggerJsdoc from 'swagger-jsdoc';
import { env } from '@config/env';

// swagger-jsdoc scans JSDoc OpenAPI annotations on route files. The path
// glob covers both source (dev) and compiled (prod on Vercel) — the spec
// is built once at module load.
const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Personal Blogging Platform API',
      version: '1.0.0',
      description: 'A RESTful API for user registration, authentication, and blog post management.',
      contact: {
        name: 'Abanoub Phelopos',
        email: 'abanoubphelopos12@gmail.com',
      },
      license: { name: 'MIT' },
    },
    servers: [
      { url: `http://localhost:${env.PORT}`, description: 'Local development' },
      { url: 'https://<your-deployment>.vercel.app', description: 'Production' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'User registration and login' },
      { name: 'Posts', description: 'Public and authenticated post operations' },
      { name: 'Health', description: 'Liveness probe' },
    ],
  },
  apis: ['./src/modules/**/*.routes.ts', './dist/modules/**/*.routes.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
