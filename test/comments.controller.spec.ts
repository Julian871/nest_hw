import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import supertest, { SuperAgentTest } from 'supertest';
import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/exeption-filter';
import { useContainer } from 'class-validator';
import { correctBlog1 } from './input-models/blogs-input-model';
import {
  correctLoginUser1,
  correctLoginUser2,
  correctUser1,
  correctUser2,
  expireToken,
} from './input-models/users-input-model';
import cookieParser from 'cookie-parser';

describe('Comments testing', () => {
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
    app.use(cookieParser());
    app.useGlobalFilters(new HttpExceptionFilter());
    useContainer(app.select(AppModule), { fallbackOnErrors: true });

    await app.init();

    agent = supertest.agent(app.getHttpServer());

    await agent.delete('/testing/all-data');
  });
  afterAll(async () => {
    await app.close();
  });

  // GET: /comments/:id
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
        .post(`/sa/blogs/${newBlog1.body.id}/posts`)
        .auth('admin', 'qwerty')
        .send({
          title: 'new title',
          shortDescription: 'new description',
          content: 'new content',
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

    it('Should get comment, return status 200', async () => {
      const getPostComments = await agent
        .get('/comments/' + newComment.body.id)
        .expect(200);
      expect(getPostComments.body).toEqual({
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
      });
    });

    it('Should not get comment, if comment id incorrect return status 404', async () => {
      const getPostComments = await agent.get('/comments/658').expect(404);
    });
  });

  // DELETE: /comments/:id
  describe('Delete comments', () => {
    beforeAll(async () => {
      await agent.delete('/testing/all-data');
    });

    let newPost1: any;
    let newBlog1: any;
    let newComment: any;
    let newUser1: any;
    let loginUser: any;
    let loginUser2: any;

    it('Create blog and post', async () => {
      newBlog1 = await agent
        .post('/sa/blogs')
        .auth('admin', 'qwerty')
        .send(correctBlog1)
        .expect(201);
      newPost1 = await agent
        .post(`/sa/blogs/${newBlog1.body.id}/posts`)
        .auth('admin', 'qwerty')
        .send({
          title: 'new title',
          shortDescription: 'new description',
          content: 'new content',
        })
        .expect(201);
    });

    it('Should create comment, return status 201', async () => {
      newUser1 = await agent
        .post('/sa/users')
        .auth('admin', 'qwerty')
        .send(correctUser1)
        .expect(201);
      loginUser = await agent
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

    it('Should create and login new user, return status 201', async () => {
      await agent
        .post('/sa/users')
        .auth('admin', 'qwerty')
        .send(correctUser2)
        .expect(201);
      loginUser2 = await agent
        .post('/auth/login')
        .send(correctLoginUser2)
        .expect(200);
    });

    it('Should not delete comment, if other owner return status 403', async () => {
      await agent
        .delete('/comments/' + newComment.body.id)
        .auth(loginUser2.body.accessToken, {
          type: 'bearer',
        })
        .expect(403);
    });

    it('Should delete comment, return status 204', async () => {
      await agent
        .delete('/comments/' + newComment.body.id)
        .auth(loginUser.body.accessToken, {
          type: 'bearer',
        })
        .expect(204);
      await agent.get('/comments/' + newComment.body.id).expect(404);
    });

    it('Should not delete comment, if incorrect auth, return status 401', async () => {
      await agent
        .delete('/comments/' + newComment.body.id)
        .auth(expireToken, {
          type: 'bearer',
        })
        .expect(401);
    });

    it('Should not delete comment, if comment id incorrect return status 404', async () => {
      const getPostComments = await agent
        .get('/comments/' + newComment.body.id)
        .expect(404);
    });
  });

  // PUT: /comments/:id
  describe('Update comments', () => {
    beforeAll(async () => {
      await agent.delete('/testing/all-data');
    });

    let newPost1: any;
    let newBlog1: any;
    let newComment: any;
    let newUser1: any;
    let loginUser: any;
    let loginUser2: any;

    it('Create blog and post', async () => {
      newBlog1 = await agent
        .post('/sa/blogs')
        .auth('admin', 'qwerty')
        .send(correctBlog1)
        .expect(201);
      newPost1 = await agent
        .post(`/sa/blogs/${newBlog1.body.id}/posts`)
        .auth('admin', 'qwerty')
        .send({
          title: 'new title',
          shortDescription: 'new description',
          content: 'new content',
        })
        .expect(201);
    });

    it('Should create comment, return status 201', async () => {
      newUser1 = await agent
        .post('/sa/users')
        .auth('admin', 'qwerty')
        .send(correctUser1)
        .expect(201);
      loginUser = await agent
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

    it('Should create and login new user, return status 201', async () => {
      await agent
        .post('/sa/users')
        .auth('admin', 'qwerty')
        .send(correctUser2)
        .expect(201);
      loginUser2 = await agent
        .post('/auth/login')
        .send(correctLoginUser2)
        .expect(200);
    });

    it('Should not update comment, if other owner return status 403', async () => {
      await agent
        .put('/comments/' + newComment.body.id)
        .auth(loginUser2.body.accessToken, {
          type: 'bearer',
        })
        .send({ content: 'update new short content' })
        .expect(403);
    });

    it('Should update comment, return status 204', async () => {
      await agent
        .put('/comments/' + newComment.body.id)
        .auth(loginUser.body.accessToken, {
          type: 'bearer',
        })
        .send({ content: 'update new short content' })
        .expect(204);
      const updateComment = await agent.get('/comments/' + newComment.body.id);
      expect(updateComment.body.content).toBe('update new short content');
    });

    it('Should not update comment, if incorrect auth, return status 401', async () => {
      await agent
        .put('/comments/' + newComment.body.id)
        .auth(expireToken, {
          type: 'bearer',
        })
        .expect(401);
    });

    it('Should not update comment, if comment id incorrect return status 404', async () => {
      const getPostComments = await agent.get('/comments/658').expect(404);
    });
  });

  // PUT: /comments/:id/like-status
  describe('Like time', () => {
    beforeAll(async () => {
      await agent.delete('/testing/all-data');
    });

    let newPost1: any;
    let newBlog1: any;
    let newComment: any;
    let newUser1: any;
    let loginUser: any;
    let refreshToken: any;

    it('Create blog and post', async () => {
      newBlog1 = await agent
        .post('/sa/blogs')
        .auth('admin', 'qwerty')
        .send(correctBlog1)
        .expect(201);
      newPost1 = await agent
        .post(`/sa/blogs/${newBlog1.body.id}/posts`)
        .auth('admin', 'qwerty')
        .send({
          title: 'new title',
          shortDescription: 'new description',
          content: 'new content',
        })
        .expect(201);
    });

    it('Should create comment, return status 201', async () => {
      newUser1 = await agent
        .post('/sa/users')
        .auth('admin', 'qwerty')
        .send(correctUser1)
        .expect(201);
      loginUser = await agent
        .post('/auth/login')
        .send(correctLoginUser1)
        .expect(200);
      refreshToken = loginUser.headers['set-cookie'][0];
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

    it('Should take Like, return status 204', async () => {
      await agent
        .put('/comments/' + newComment.body.id + '/like-status')
        .auth(loginUser.body.accessToken, {
          type: 'bearer',
        })
        .send({ likeStatus: 'Like' })
        .expect(204);
      const updateComment = await agent
        .get('/comments/' + newComment.body.id)
        .set('Cookie', refreshToken);
      expect(updateComment.body.likesInfo.myStatus).toBe('Like');
    });

    it('Should not take Dislike, if incorrect auth, return status 401', async () => {
      await agent
        .put('/comments/' + newComment.body.id + '/like-status')
        .auth(expireToken, {
          type: 'bearer',
        })
        .send({ likeStatus: 'Dislike' })
        .expect(401);
    });

    it('Should not take None, if comment id incorrect return status 404', async () => {
      const getPostComments = await agent
        .get('/comments/658')
        .auth(expireToken, {
          type: 'bearer',
        })
        .send({ likeStatus: 'None' })
        .expect(404);
    });
  });
});
