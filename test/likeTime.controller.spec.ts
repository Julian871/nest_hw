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
import cookieParser from 'cookie-parser';

describe('Like testing', () => {
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
  describe('Likes to post', () => {
    jest.setTimeout(10000);
    let user1: any;
    let newPost: any;
    let user2: any;
    it('Create blog/post', async () => {
      const newBlog1 = await agent
        .post('/sa/blogs')
        .auth('admin', 'qwerty')
        .send(correctBlog1)
        .expect(201);
      newPost = await agent
        .post(`/sa/blogs/${newBlog1.body.id}/posts`)
        .auth('admin', 'qwerty')
        .send({
          title: 'new title',
          shortDescription: 'new description',
          content: 'new content',
        })
        .expect(201);
      expect(newPost.body).toEqual({
        id: expect.any(String),
        title: newPost.body.title,
        shortDescription: newPost.body.shortDescription,
        content: newPost.body.content,
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

    it('Take like', async () => {
      await agent
        .post('/sa/users')
        .auth('admin', 'qwerty')
        .send({
          login: 'user1',
          password: 'qwerty',
          email: 'new@amil.ru',
        })
        .expect(201);

      user1 = await agent
        .post('/auth/login')
        .auth('admin', 'qwerty')
        .send({
          loginOrEmail: 'user1',
          password: 'qwerty',
        })
        .expect(200);

      await agent
        .put(`/posts/${newPost.body.id}/like-status`)
        .auth(user1.body.accessToken, {
          type: 'bearer',
        })
        .send({ likeStatus: 'Like' })
        .expect(204);

      const getPost = await agent
        .get(`/posts/${newPost.body.id}`)
        .set('Cookie', user1.headers['set-cookie'][0])
        .expect(200);
      expect(getPost.body).toEqual({
        id: expect.any(String),
        title: expect.any(String),
        shortDescription: expect.any(String),
        content: expect.any(String),
        blogId: expect.any(String),
        blogName: expect.any(String),
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 1,
          dislikesCount: 0,
          myStatus: 'Like',
          newestLikes: [
            {
              addedAt: expect.any(String),
              userId: expect.any(String),
              login: 'user1',
            },
          ],
        },
      });
    });
  });
});
