import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import supertest, { SuperAgentTest } from 'supertest';
import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppModule } from '../../src/app.module';
import { HttpExceptionFilter } from '../../src/exeption-filter';
import { correctBlog1, correctBlog2 } from '../blogs/blogs-input-model';

describe('Posts testing', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        MongooseModule.forRoot(process.env.MONGO_URL || ''),
        AppModule,
      ],
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

    await app.init();

    agent = supertest.agent(app.getHttpServer());

    await agent.delete('/testing/all-data');
  });
  afterAll(async () => {
    await app.close();
  });

  // POST: /posts
  describe('Create post', () => {
    beforeAll(async () => {
      await agent.delete('/testing/all-data');
    });

    it('Should create post, return status 201 and post information', async () => {
      const newBlog1 = await agent
        .post('/blogs')
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
    beforeAll(async () => {
      await agent.delete('/testing/all-data');
    });

    it('Should get all posts, return status 200', async () => {
      const newBlog1 = await agent
        .post('/blogs')
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
        .post('/blogs')
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
      await agent.get('/posts/658d153438c7b301a4707f40').expect(404);
    });

    /*it('Should not get post, if id not valid, return 400', async () => {
      const getPosts = await agent.get('/posts/invalid').expect(400);
      expect(getPosts.body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'blogId',
          },
        ],
      });
    });*/
  });

  // UPDATE: /posts/:id
  describe('Update posts', () => {
    beforeAll(async () => {
      await agent.delete('/testing/all-data');
    });

    it('Should update post, return status 204', async () => {
      const newBlog1 = await agent
        .post('/blogs')
        .auth('admin', 'qwerty')
        .send(correctBlog1)
        .expect(201);
      const newBlog2 = await agent
        .post('/blogs')
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
        .put('/posts/' + newPost1.body.id)
        .auth('admin', 'qwerty')
        .send({
          title: 'update title',
          shortDescription: 'update description 2',
          content: 'update content 2',
          blogId: newBlog2.body.id,
        })
        .expect(204);
    });

    it('Should not update post, if input values incorrect, return status 400', async () => {
      const newBlog1 = await agent
        .post('/blogs')
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
      const updatePost = await agent
        .put('/posts/' + newPost1.body.id)
        .auth('admin', 'qwerty')
        .send({
          title: 'update title a lot of symbols, more then 30',
          shortDescription: '     ',
          content: '   ',
          blogId: '   ',
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
          {
            message: expect.any(String),
            field: 'blogId',
          },
        ],
      });
    });

    it('Should not update post, if auth incorrect return status 401', async () => {
      await agent
        .put('/posts/658d153438c7b301a4707f40')
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
      await agent
        .put('/posts/658d153438c7b301a4707f40')
        .auth('admin', 'qwerty')
        .send({
          title: 'update title',
          shortDescription: 'update description 2',
          content: 'update content 2',
          blogId: '658d153438c7b301a4707f40',
        })
        .expect(404);
    });
  });

  // DELETE: /posts/:id
  describe('Delete posts', () => {
    beforeAll(async () => {
      await agent.delete('/testing/all-data');
    });

    it('Should delete post, return status 204', async () => {
      const newBlog1 = await agent
        .post('/blogs')
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
      await agent
        .delete('/posts/' + newPost1.body.id)
        .auth('admin', 'qwerty')
        .expect(204);
    });

    it('Should not update post, if auth incorrect return status 401', async () => {
      await agent
        .delete('/posts/658d153438c7b301a4707f40')
        .auth('admin', 'incorrect')
        .expect(401);
    });

    it('Should not delete post, if post not found return status 404', async () => {
      await agent
        .delete('/posts/658d153438c7b301a4707f40')
        .auth('admin', 'qwerty')
        .expect(404);
    });
  });

  // POST: /posts/:posId/comments
  /*describe('Delete posts', () => {
    beforeAll(async () => {
      await agent.delete('/testing/all-data');
    });

    it('Should create post, return status 201', async () => {
      const newUser = await agent
        .post('/users')
        .auth('admin', 'qwerty')
        .send(correctUser1)
        .expect(201);
      const newBlog1 = await agent
        .post('/blogs')
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
      console.log('token:', newUser.request);
      const newComment = await agent
        .post('/posts/' + newPost1.body.id + '/comments')
        .auth(newUser.body.accessToken, {
          type: 'bearer',
        })
        .send({ content: 'new content to testing' })
        .expect(201);
      expect(newComment.body).toEqual({
        id: expect.any(String),
        content: 'new content to testing',
        commentatorInfo: {
          userId: newUser.body.id,
          userLogin: newUser.body.login,
        },
        createdAt: expect.any(String),
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
        },
      });
    });
  });*/
});
