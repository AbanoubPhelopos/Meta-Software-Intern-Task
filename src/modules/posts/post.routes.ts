import { Router } from 'express';
import { validate } from '../../middlewares/validate.middleware';
import { authenticate } from '../../middlewares/authenticate.middleware';
import * as postController from './post.controller';
import {
  createPostSchema,
  listPostsQuerySchema,
  postIdParamSchema,
  updatePostSchema,
} from './post.schema';

const router = Router();

/**
 * @openapi
 * /api/v1/posts:
 *   get:
 *     tags: [Posts]
 *     summary: List all posts (public)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
 *       - in: query
 *         name: authorId
 *         schema: { type: integer, minimum: 1 }
 *     responses:
 *       200:
 *         description: Paginated list of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Post' }
 *                 meta:  { $ref: '#/components/schemas/PaginationMeta' }
 */
router.get('/', validate({ query: listPostsQuerySchema }), postController.list);

/**
 * @openapi
 * /api/v1/posts/{id}:
 *   get:
 *     tags: [Posts]
 *     summary: Get a single post (public)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     responses:
 *       200:
 *         description: Post found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:    { $ref: '#/components/schemas/Post' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get('/:id', validate({ params: postIdParamSchema }), postController.getById);

/**
 * @openapi
 * /api/v1/posts:
 *   post:
 *     tags: [Posts]
 *     summary: Create a new post (authenticated)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content]
 *             properties:
 *               title:   { type: string, minLength: 1, maxLength: 200 }
 *               content: { type: string, minLength: 1 }
 *     responses:
 *       201:
 *         description: Post created
 *         content: { application/json: { schema: { $ref: '#/components/schemas/Post' } } }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.post('/', authenticate, validate({ body: createPostSchema }), postController.create);

/**
 * @openapi
 * /api/v1/posts/{id}:
 *   put:
 *     tags: [Posts]
 *     summary: Update a post (owner only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:   { type: string, minLength: 1, maxLength: 200 }
 *               content: { type: string, minLength: 1 }
 *     responses:
 *       200:
 *         description: Post updated
 *         content: { application/json: { schema: { $ref: '#/components/schemas/Post' } } }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.put(
  '/:id',
  authenticate,
  validate({ params: postIdParamSchema, body: updatePostSchema }),
  postController.update,
);

/**
 * @openapi
 * /api/v1/posts/{id}:
 *   delete:
 *     tags: [Posts]
 *     summary: Delete a post (owner only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     responses:
 *       204: { description: Post deleted }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.delete('/:id', authenticate, validate({ params: postIdParamSchema }), postController.remove);

export default router;
