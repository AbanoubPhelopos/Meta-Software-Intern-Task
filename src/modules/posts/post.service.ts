import { ApiError } from '@shared/errors/ApiError';
import { ErrorCodes } from '@shared/errors/errorCodes';
import * as postRepository from '@modules/posts/post.repository';
import type { ListPostsQuery } from '@modules/posts/post.schema';

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
