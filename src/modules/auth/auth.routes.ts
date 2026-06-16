import { Router } from 'express';
import { validate } from '../../middlewares/validate.middleware';
import * as authController from './auth.controller';
import { loginSchema, registerSchema } from './auth.schema';

const router = Router();

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:     { type: string, minLength: 2, maxLength: 100 }
 *               email:    { type: string, format: email }
 *               password: { type: string, minLength: 8, maxLength: 128 }
 *     responses:
 *       201:
 *         description: User registered
 *         content: { application/json: { schema: { $ref: '#/components/schemas/AuthResult' } } }
 *       409: { $ref: '#/components/responses/Conflict' }
 *       429: { $ref: '#/components/responses/TooManyRequests' }
 */
router.post('/register', validate({ body: registerSchema }), authController.register);

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Authenticate and receive a JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful
 *         content: { application/json: { schema: { $ref: '#/components/schemas/AuthResult' } } }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       429: { $ref: '#/components/responses/TooManyRequests' }
 */
router.post('/login', validate({ body: loginSchema }), authController.login);

export default router;
