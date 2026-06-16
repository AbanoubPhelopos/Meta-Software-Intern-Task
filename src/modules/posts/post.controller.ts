import type { Request, Response } from 'express';
import { asyncHandler } from '@shared/utils/asyncHandler';
import type { PaginatedResponse, SuccessResponse } from '@shared/types/api';
import * as postService from '@modules/posts/post.service';
import type { ListPostsQuery } from '@modules/posts/post.schema';

type PostWithAuthor = Awaited<ReturnType<typeof postService.getPost>>;

export const list = asyncHandler(async (req: Request, res: Response) => {
  const result = await postService.listPosts(req.query as unknown as ListPostsQuery);
  const body: PaginatedResponse<PostWithAuthor> = {
    success: true,
    data: result.posts,
    meta: result.meta,
  };
  res.status(200).json(body);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const result = await postService.getPost((req.params as unknown as { id: number }).id);
  const body: SuccessResponse<PostWithAuthor> = { success: true, data: result };
  res.status(200).json(body);
});
