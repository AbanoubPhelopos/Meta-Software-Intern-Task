import { Router } from 'express';
import { validate } from '@middlewares/validate.middleware';
import * as authController from '@modules/auth/auth.controller';
import { loginSchema, registerSchema } from '@modules/auth/auth.schema';

const router = Router();

router.post('/register', validate({ body: registerSchema }), authController.register);
router.post('/login', validate({ body: loginSchema }), authController.login);

export default router;
