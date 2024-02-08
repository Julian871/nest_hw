import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import supertest, { SuperAgentTest } from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/exeption-filter';
import { correctBlog1, correctBlog2 } from './input-models/blogs-input-model';
import { useContainer } from 'class-validator';
import {
  correctLoginUser1,
  correctLoginUser2,
  correctLoginUser3,
  correctUser1,
  correctUser2,
  correctUser3,
  expireToken,
} from './input-models/users-input-model';
import cookieParser from 'cookie-parser';

describe('Posts testing', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        stopAtFirstError: true,
        exceptionFactory: (errors: any) => {
          const errorsForResponse: any = [];
          errors.forEach((e) => {
            const constraintsKeys = Object.keys(e.constraints);
            constraintsKeys.forEach((ckey) => {
              errorsForResponse.push({
                message: e.constraints[ckey],
                field: e.property,
              });
            });
          });
          throw new BadRequestException(errorsForResponse);
        },
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    app.use(cookieParser());
    await app.init();

    agent = supertest.agent(app.getHttpServer());

    await agent.delete('/testing/all-data');
  });
  afterAll(async () => {
    await app.close();
  });

  // POST: /posts
  describe('Create post', () => {
    it('Should create post, return status 201 and post information', async () => {
      const newBlog1 = await agent
        .post('/sa/blogs')
        .auth('admin', 'qwerty')
        .send(correctBlog1)
        .expect(201);
      const newPost1 = await agent
        .post('/posts')
        .auth('admin', 'qwerty')
        .send({
          title: 'new title',
          shortDescription: 'new description',
          content: 'new content',
          blogId: newBlog1.body.id,
        })
        .expect(201);
      expect(newPost1.body).toEqual({
        id: expect.any(String),
        title: newPost1.body.title,
        shortDescription: newPost1.body.shortDescription,
        content: newPost1.body.content,
        blogId: newBlog1.body.id,
        blogName: expect.any(String),
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
          newestLikes: [],
        },
      });
    });

    it('Should not create post, if input values incorrect, return status 400', async () => {
      const newPost = await agent
        .post('/posts')
        .auth('admin', 'qwerty')
        .send({
          title: 'cfgdfgbgbdfgbdfbgdddddddgfdgfgdgdfgdfgdfgdfgdgefefe',
          shortDescription: '      ',
          content: '       ',
          blogId: '    ',
        })
        .expect(400);
      expect(newPost.body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'title',
          },
          {
            message: expect.any(String),
            field: 'shortDescription',
          },
          {
            message: expect.any(String),
            field: 'content',
          },
          {
            message: expect.any(String),
            field: 'blogId',
          },
        ],
      });
    });

    it('Should not create post, if incorrect auth data. Return status 401', async () => {
      await agent
        .post('/posts')
        .auth('admin', 'incorrect')
        .send('')
        .expect(401);
    });
  });

  // GET: /posts, /posts/:id
  describe('Get posts', () => {
    jest.setTimeout(7000);
    it('Should get all posts, return status 200', async () => {
      await agent.delete('/testing/all-data');
      const newBlog1 = await agent
        .post('/sa/blogs')
        .auth('admin', 'qwerty')
        .send(correctBlog1)
        .expect(201);
      const newPost1 = await agent
        .post('/posts')
        .auth('admin', 'qwerty')
        .send({
          title: 'new title',
          shortDescription: 'new description',
          content: 'new content',
          blogId: newBlog1.body.id,
        })
        .expect(201);
      const newPost2 = await agent
        .post('/posts')
        .auth('admin', 'qwerty')
        .send({
          title: 'new title 2',
          shortDescription: 'new description 2',
          content: 'new content 2',
          blogId: newBlog1.body.id,
        })
        .expect(201);
      const getPosts = await agent.get('/posts').expect(200);
      expect(getPosts.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: [
          {
            id: newPost2.body.id,
            title: expect.any(String),
            shortDescription: expect.any(String),
            content: expect.any(String),
            blogId: expect.any(String),
            blogName: expect.any(String),
            createdAt: expect.any(String),
            extendedLikesInfo: {
              likesCount: 0,
              dislikesCount: 0,
              myStatus: 'None',
              newestLikes: [],
            },
          },
          {
            id: newPost1.body.id,
            title: expect.any(String),
            shortDescription: expect.any(String),
            content: expect.any(String),
            blogId: expect.any(String),
            blogName: expect.any(String),
            createdAt: expect.any(String),
            extendedLikesInfo: {
              likesCount: 0,
              dislikesCount: 0,
              myStatus: 'None',
              newestLikes: [],
            },
          },
        ],
      });
    });

    it('Should get post by id, return status 200', async () => {
      const newBlog1 = await agent
        .post('/sa/blogs')
        .auth('admin', 'qwerty')
        .send(correctBlog1)
        .expect(201);
      const newPost1 = await agent
        .post('/posts')
        .auth('admin', 'qwerty')
        .send({
          title: 'new title',
          shortDescription: 'new description',
          content: 'new content',
          blogId: newBlog1.body.id,
        })
        .expect(201);
      const getPosts = await agent
        .get('/posts/' + newPost1.body.id)
        .expect(200);
      expect(getPosts.body).toEqual({
        id: newPost1.body.id,
        title: expect.any(String),
        shortDescription: expect.any(String),
        content: expect.any(String),
        blogId: expect.any(String),
        blogName: expect.any(String),
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
          newestLikes: [],
        },
      });
    });

    it('Should not get post, if post not found, return status 404', async () => {
      await agent.get('/posts/658').expect(404);
    });
  });

  // UPDATE: /posts/:id
  describe('Update posts', () => {
    it('Should update post, return status 204', async () => {
      const newBlog1 = await agent
        .post('/sa/blogs')
        .auth('admin', 'qwerty')
        .send(correctBlog1)
        .expect(201);
      const newBlog2 = await agent
        .post('/sa/blogs')
        .auth('admin', 'qwerty')
        .send(correctBlog2)
        .expect(201);
      const newPost1 = await agent
        .post('/posts')
        .auth('admin', 'qwerty')
        .send({
          title: 'new title',
          shortDescription: 'new description',
          content: 'new content',
          blogId: newBlog1.body.id,
        })
        .expect(201);
      await agent
        .put(`/sa/blogs/${newBlog1.body.id}/posts/${newPost1.body.id}`)
        .auth('admin', 'qwerty')
        .send({
          title: 'update title',
          shortDescription: 'update description 2',
          content: 'update content 2',
          blogId: newBlog2.body.id,
        })
        .expect(204);
    });

    let newBlog1;
    let newPost1;

    it('Should not update post, if input values incorrect, return status 400', async () => {
      newBlog1 = await agent
        .post('/sa/blogs')
        .auth('admin', 'qwerty')
        .send(correctBlog1)
        .expect(201);
      newPost1 = await agent
        .post('/posts')
        .auth('admin', 'qwerty')
        .send({
          title: 'new title',
          shortDescription: 'new description',
          content: 'new content',
          blogId: newBlog1.body.id,
        })
        .expect(201);
      const updatePost = await agent
        .put(`/sa/blogs/${newBlog1.body.id}/posts/${newPost1.body.id}`)
        .auth('admin', 'qwerty')
        .send({
          title: 'update title a lot of symbols, more then 30',
          shortDescription: '     ',
          content: '   ',
        })
        .expect(400);
      expect(updatePost.body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'title',
          },
          {
            message: expect.any(String),
            field: 'shortDescription',
          },
          {
            message: expect.any(String),
            field: 'content',
          },
        ],
      });
    });

    it('Should not update post, if auth incorrect return status 401', async () => {
      await agent
        .put(`/sa/blogs/${newBlog1.body.id}/posts/${newPost1.body.id}`)
        .auth('admin', 'incorrect')
        .send({
          title: 'update title',
          shortDescription: 'update description 2',
          content: 'update content 2',
          blogId: '658d153438c7b301a4707f40',
        })
        .expect(401);
    });

    it('Should not update post, if post not found return status 404', async () => {
      const newBlog1 = await agent
        .post('/sa/blogs')
        .auth('admin', 'qwerty')
        .send(correctBlog1)
        .expect(201);
      await agent
        .put(`/sa/blogs/${newBlog1.body.id}/posts/404`)
        .auth('admin', 'qwerty')
        .send({
          title: 'update title',
          shortDescription: 'update description 2',
          content: 'update content 2',
          blogId: newBlog1.body.id,
        })
        .expect(404);
    });
  });

  // DELETE: /posts/:id
  describe('Delete posts', () => {
    let newBlog1;
    let newPost1;

    it('Should delete post, return status 204', async () => {
      newBlog1 = await agent
        .post('/sa/blogs')
        .auth('admin', 'qwerty')
        .send(correctBlog1)
        .expect(201);
      newPost1 = await agent
        .post('/posts')
        .auth('admin', 'qwerty')
        .send({
          title: 'new title',
          shortDescription: 'new description',
          content: 'new content',
          blogId: newBlog1.body.id,
        })
        .expect(201);
      await agent
        .delete(`/sa/blogs/${newBlog1.body.id}/posts/${newPost1.body.id}`)
        .auth('admin', 'qwerty')
        .expect(204);
    });

    it('Should not update post, if auth incorrect return status 401', async () => {
      await agent
        .delete(`/sa/blogs/${newBlog1.body.id}/posts/${newPost1.body.id}`)
        .auth('admin', 'incorrect')
        .expect(401);
    });

    it('Should not delete post, if post not found return status 404', async () => {
      await agent
        .delete(`/sa/blogs/${newBlog1.body.id}/posts/404`)
        .auth('admin', 'qwerty')
        .expect(404);
    });
  });

  // POST: /posts/:posId/comments
  describe('Create comments', () => {
    let newPost1: any;
    let newBlog1: any;

    it('Create blog and post', async () => {
      newBlog1 = await agent
        .post('/sa/blogs')
        .auth('admin', 'qwerty')
        .send(correctBlog1)
        .expect(201);
      newPost1 = await agent
        .post('/posts')
        .auth('admin', 'qwerty')
        .send({
          title: 'new title',
          shortDescription: 'new description',
          content: 'new content',
          blogId: newBlog1.body.id,
        })
        .expect(201);
    });

    it('Should create comment, return status 201', async () => {
      const newUser1 = await agent
        .post('/sa/users')
        .auth('admin', 'qwerty')
        .send(correctUser1)
        .expect(201);
      const loginUser = await agent
        .post('/auth/login')
        .send(correctLoginUser1)
        .expect(200);
      const newComment = await agent
        .post('/posts/' + newPost1.body.id + '/comments')
        .auth(loginUser.body.accessToken, {
          type: 'bearer',
        })
        .send({ content: 'new content to testing' })
        .expect(201);
      expect(newComment.body).toEqual({
        id: expect.any(String),
        content: 'new content to testing',
        commentatorInfo: {
          userId: newUser1.body.id,
          userLogin: newUser1.body.login,
        },
        createdAt: expect.any(String),
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
        },
      });
    });

    it('Should not create comment, if input values incorrect, return status 400', async () => {
      await agent
        .post('/sa/users')
        .auth('admin', 'qwerty')
        .send(correctUser2)
        .expect(201);
      const loginUser = await agent
        .post('/auth/login')
        .send(correctLoginUser2)
        .expect(200);
      const newComment = await agent
        .post('/posts/' + newPost1.body.id + '/comments')
        .auth(loginUser.body.accessToken, {
          type: 'bearer',
        })
        .send({ content: 'length < 20' })
        .expect(400);
      expect(newComment.body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'content',
          },
        ],
      });
    });

    it('Should not create comment, if auth incorrect return status 401', async () => {
      await agent
        .post('/posts/' + newPost1.body.id + '/comments')
        .auth(expireToken, {
          type: 'bearer',
        })
        .send({ content: 'new content to testing' })
        .expect(401);
    });

    it('Should not create comment, if posts not exist return status 404', async () => {
      await agent
        .post('/sa/users')
        .auth('admin', 'qwerty')
        .send(correctUser3)
        .expect(201);
      const loginUser = await agent
        .post('/auth/login')
        .send(correctLoginUser3)
        .expect(200);
      await agent
        .post('/posts/658/comments')
        .auth(loginUser.body.accessToken, {
          type: 'bearer',
        })
        .send({ content: 'new content to testing' })
        .expect(404);
    });
  });

  // GET: /posts/:posId/comments
  describe('Get comments', () => {
    beforeAll(async () => {
      await agent.delete('/testing/all-data');
    });

    let newPost1: any;
    let newBlog1: any;
    let newComment: any;
    let newUser1: any;

    it('Create blog and post', async () => {
      newBlog1 = await agent
        .post('/sa/blogs')
        .auth('admin', 'qwerty')
        .send(correctBlog1)
        .expect(201);
      newPost1 = await agent
        .post('/posts')
        .auth('admin', 'qwerty')
        .send({
          title: 'new title',
          shortDescription: 'new description',
          content: 'new content',
          blogId: newBlog1.body.id,
        })
        .expect(201);
    });

    it('Should create comment, return status 201', async () => {
      newUser1 = await agent
        .post('/sa/users')
        .auth('admin', 'qwerty')
        .send(correctUser1)
        .expect(201);
      const loginUser = await agent
        .post('/auth/login')
        .send(correctLoginUser1)
        .expect(200);
      newComment = await agent
        .post('/posts/' + newPost1.body.id + '/comments')
        .auth(loginUser.body.accessToken, {
          type: 'bearer',
        })
        .send({ content: 'new content to testing' })
        .expect(201);
      expect(newComment.body).toEqual({
        id: expect.any(String),
        content: 'new content to testing',
        commentatorInfo: {
          userId: newUser1.body.id,
          userLogin: newUser1.body.login,
        },
        createdAt: expect.any(String),
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
        },
      });
    });

    it('Should get comment to post, return status 200', async () => {
      const getPostComments = await agent
        .get('/posts/' + newPost1.body.id + '/comments')
        .expect(200);
      expect(getPostComments.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          {
            id: newComment.body.id,
            content: newComment.body.content,
            commentatorInfo: {
              userId: newUser1.body.id,
              userLogin: newUser1.body.login,
            },
            createdAt: newComment.body.createdAt,
            likesInfo: {
              likesCount: 0,
              dislikesCount: 0,
              myStatus: 'None',
            },
          },
        ],
      });
    });

    it('Should not get comment to post, if postId incorrect return status 404', async () => {
      await agent
        .get('/posts/658/comments')
        .auth('admin', 'qwerty')
        .expect(404);
    });
  });

  // PUT: /posts/:posId/like-status
  describe('Like time', () => {
    beforeAll(async () => {
      await agent.delete('/testing/all-data');
    });

    let newPost1: any;
    let newBlog1: any;
    let refreshToken: any;

    it('Create blog and post', async () => {
      newBlog1 = await agent
        .post('/sa/blogs')
        .auth('admin', 'qwerty')
        .send(correctBlog1)
        .expect(201);
      newPost1 = await agent
        .post('/posts')
        .auth('admin', 'qwerty')
        .send({
          title: 'new title',
          shortDescription: 'new description',
          content: 'new content',
          blogId: newBlog1.body.id,
        })
        .expect(201);
    });

    it('Should take Like, return status 201', async () => {
      await agent
        .post('/sa/users')
        .auth('admin', 'qwerty')
        .send(correctUser1)
        .expect(201);
      const loginUser = await agent
        .post('/auth/login')
        .send(correctLoginUser1)
        .expect(200);
      await agent
        .put('/posts/' + newPost1.body.id + '/like-status')
        .auth(loginUser.body.accessToken, {
          type: 'bearer',
        })
        .send({ likeStatus: 'Like' })
        .expect(204);
    });

    it('Should take Dislike to post insteadof like', async () => {
      const loginUser = await agent
        .post('/auth/login')
        .send(correctLoginUser1)
        .expect(200);
      refreshToken = loginUser.headers['set-cookie'][0];
      await agent
        .put('/posts/' + newPost1.body.id + '/like-status')
        .auth(loginUser.body.accessToken, {
          type: 'bearer',
        })
        .send({ likeStatus: 'Dislike' })
        .expect(204);
      const getPost = await agent
        .get('/posts/' + newPost1.body.id)
        .set('Cookie', refreshToken);
      expect(getPost.body.extendedLikesInfo.myStatus).toBe('Dislike');
    });

    it('Should not take like, if incorrect input values, return status 400', async () => {
      const loginUser = await agent
        .post('/auth/login')
        .send(correctLoginUser1)
        .expect(200);
      await agent
        .put('/posts/' + newPost1.body.id + '/like-status')
        .auth(loginUser.body.accessToken, {
          type: 'bearer',
        })
        .send({ likeStatus: 'dike' })
        .expect(400);
    });

    it('Should not take like, if auth incorrect', async () => {
      await agent.post('/auth/login').send(correctLoginUser1).expect(200);
      await agent
        .put('/posts/' + newPost1.body.id + '/like-status')
        .auth(expireToken, {
          type: 'bearer',
        })
        .send({ likeStatus: 'Like' })
        .expect(401);
    });

    it('Should not take like, if incorrect postId, return status 404', async () => {
      const loginUser = await agent
        .post('/auth/login')
        .send(correctLoginUser1)
        .expect(200);
      await agent
        .put('/posts/658fcb001c34ccb6b9e9e4a8/like-status')
        .auth(loginUser.body.accessToken, {
          type: 'bearer',
        })
        .send({ likeStatus: 'dike' })
        .expect(400);
    });
  });
});
