import { ApiError } from '../../shared/errors/ApiError';
import { ErrorCodes } from '../../shared/errors/errorCodes';
import * as postRepository from './post.repository';
import type { CreatePostInput, ListPostsQuery, UpdatePostInput } from './post.schema';

export interface PaginatedPosts {
  posts: Awaited<ReturnType<typeof postRepository.findMany>>;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const listPosts = async (query: ListPostsQuery): Promise<PaginatedPosts> => {
  const { page, limit, authorId } = query;
  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    postRepository.findMany({ skip, take: limit, authorId }),
    postRepository.count(authorId),
  ]);

  return {
    posts,
    meta: {
      page,
      limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    },
  };
};

export const getPost = async (id: number) => {
  const post = await postRepository.findById(id);
  if (!post) {
    throw ApiError.notFound(`Post ${id} not found`, ErrorCodes.POST_NOT_FOUND);
  }
  return post;
};

export const createPost = async (authorId: number, input: CreatePostInput) => {
  return postRepository.create({
    title: input.title,
    content: input.content,
    author: { connect: { id: authorId } },
  });
};

export const updatePost = async (id: number, authorId: number, input: UpdatePostInput) => {
  await assertOwned(id, authorId);
  return postRepository.update(id, buildPatch(input));
};

export const deletePost = async (id: number, authorId: number) => {
  await assertOwned(id, authorId);
  await postRepository.remove(id);
};

const assertOwned = async (id: number, authorId: number): Promise<void> => {
  const existing = await postRepository.findById(id);
  if (!existing) {
    throw ApiError.notFound(`Post ${id} not found`, ErrorCodes.POST_NOT_FOUND);
  }
  if (existing.authorId !== authorId) {
    throw ApiError.forbidden('You can only modify your own posts', ErrorCodes.NOT_POST_OWNER);
  }
};

const buildPatch = (input: UpdatePostInput) => ({
  ...(input.title !== undefined && { title: input.title }),
  ...(input.content !== undefined && { content: input.content }),
});
