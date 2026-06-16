import { Router } from 'express';
import { validate } from '@middlewares/validate.middleware';
import * as postController from '@modules/posts/post.controller';
import { listPostsQuerySchema, postIdParamSchema } from '@modules/posts/post.schema';

const router = Router();

router.get('/', validate({ query: listPostsQuerySchema }), postController.list);
router.get('/:id', validate({ params: postIdParamSchema }), postController.getById);

export default router;
