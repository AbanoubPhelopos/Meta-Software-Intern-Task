import type { Request, Response } from 'express';
import { asyncHandler } from '@shared/utils/asyncHandler';
import type { SuccessResponse } from '@shared/types/api';
import * as authService from '@modules/auth/auth.service';
import type { AuthResult } from '@modules/auth/auth.service';
import type { LoginInput, RegisterInput } from '@modules/auth/auth.schema';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body as RegisterInput);
  const body: SuccessResponse<AuthResult> = { success: true, data: result };
  res.status(201).json(body);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body as LoginInput);
  const body: SuccessResponse<AuthResult> = { success: true, data: result };
  res.status(200).json(body);
});
