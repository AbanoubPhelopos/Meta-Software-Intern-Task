import type { Request, Response } from 'express';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { requireUser } from '../../middlewares/authenticate.middleware';
import type { PaginatedResponse, SuccessResponse } from '../../shared/types/api';
import * as postService from './post.service';
import type { CreatePostInput, ListPostsQuery, PostIdParam, UpdatePostInput } from './post.schema';

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
  const { id } = req.params as unknown as PostIdParam;
  const result = await postService.getPost(id);
  const body: SuccessResponse<PostWithAuthor> = { success: true, data: result };
  res.status(200).json(body);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const { id: authorId } = requireUser(req);
  const result = await postService.createPost(authorId, req.body as CreatePostInput);
  const body: SuccessResponse<PostWithAuthor> = { success: true, data: result };
  res.status(201).json(body);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const { id: authorId } = requireUser(req);
  const { id } = req.params as unknown as PostIdParam;
  const result = await postService.updatePost(id, authorId, req.body as UpdatePostInput);
  const body: SuccessResponse<PostWithAuthor> = { success: true, data: result };
  res.status(200).json(body);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const { id: authorId } = requireUser(req);
  const { id } = req.params as unknown as PostIdParam;
  await postService.deletePost(id, authorId);
  res.status(204).send();
});
