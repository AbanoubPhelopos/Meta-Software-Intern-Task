import { Router } from 'express';
import { validate } from '@middlewares/validate.middleware';
import { authenticate } from '@middlewares/authenticate.middleware';
import * as postController from '@modules/posts/post.controller';
import {
  createPostSchema,
  listPostsQuerySchema,
  postIdParamSchema,
  updatePostSchema,
} from '@modules/posts/post.schema';

const router = Router();

router.get('/', validate({ query: listPostsQuerySchema }), postController.list);
router.get('/:id', validate({ params: postIdParamSchema }), postController.getById);

router.post('/', authenticate, validate({ body: createPostSchema }), postController.create);
router.put(
  '/:id',
  authenticate,
  validate({ params: postIdParamSchema, body: updatePostSchema }),
  postController.update,
);
router.delete('/:id', authenticate, validate({ params: postIdParamSchema }), postController.remove);

export default router;
