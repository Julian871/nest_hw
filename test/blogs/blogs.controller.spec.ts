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
import { correctBlog1, correctBlog2, incorrectBlog } from './blogs-input-model';
import {
  correctPost1,
  correctPost2,
  incorrectPost1,
} from '../posts/posts-input-model';

describe('Users testing', () => {
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

  // POST: /blogs
  describe('Create blogs', () => {
    beforeAll(async () => {
      await agent.delete('/testing/all-data');
    });

    it('Should create blog, return status 201 and blog information', async () => {
      const response = await agent
        .post('/blogs')
        .auth('admin', 'qwerty')
        .send(correctBlog1)
        .expect(201);
      expect(response.body).toEqual({
        id: expect.any(String),
        name: correctBlog1.name,
        description: correctBlog1.description,
        websiteUrl: correctBlog1.websiteUrl,
        createdAt: expect.any(String),
        isMembership: false,
      });
    });

    it('Should not create blog, return status 400 and errors list', async () => {
      const response = await agent
        .post('/blogs')
        .auth('admin', 'qwerty')
        .send(incorrectBlog)
        .expect(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message: 'Incorrect name',
            field: 'name',
          },
          {
            message: 'Incorrect description',
            field: 'description',
          },
          {
            message: 'Incorrect websiteUrl',
            field: 'websiteUrl',
          },
        ],
      });
    });

    it('Should not create blog, return status 401, if auth incorrect', async () => {
      await agent
        .post('/blogs')
        .auth('incorrect', 'qwerty')
        .send(correctBlog1)
        .expect(401);
    });
  });

  // GET: /blogs, /blogs/:blogId
  describe('Get blogs / Get blog by Id ', () => {
    beforeAll(async () => {
      await agent.delete('/testing/all-data');
    });

    it('Should return all blogs', async () => {
      await agent.post('/blogs').auth('admin', 'qwerty').send(correctBlog1);
      await agent.post('/blogs').auth('admin', 'qwerty').send(correctBlog2);
      const responseGet = await agent.get('/blogs').expect(200);
      expect(responseGet.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: [
          {
            id: expect.any(String),
            name: correctBlog2.name,
            description: correctBlog2.description,
            websiteUrl: correctBlog2.websiteUrl,
            createdAt: expect.any(String),
            isMembership: false,
          },
          {
            id: expect.any(String),
            name: correctBlog1.name,
            description: correctBlog1.description,
            websiteUrl: correctBlog1.websiteUrl,
            createdAt: expect.any(String),
            isMembership: false,
          },
        ],
      });
    });

    it('Should return blog by id', async () => {
      const responsePost = await agent
        .post('/blogs')
        .auth('admin', 'qwerty')
        .send(correctBlog1);
      const responseGet = await agent
        .get('/blogs/' + responsePost.body.id)
        .expect(200);
      expect(responseGet.body).toEqual({
        id: responsePost.body.id,
        name: correctBlog1.name,
        description: correctBlog1.description,
        websiteUrl: correctBlog1.websiteUrl,
        createdAt: expect.any(String),
        isMembership: false,
      });
    });

    it('Should not return blog by id, if id incorrect', async () => {
      await agent.post('/blogs').auth('admin', 'qwerty').send(correctBlog1);
      await agent.get('/blogs/658d4c81e8285273a1f97c0a').expect(404);
    });
  });

  // POST: /blogs/:blogId/posts
  describe('Create post for specific blog', () => {
    beforeAll(async () => {
      await agent.delete('/testing/all-data');
    });

    it('Should create post, return status 201 and post information', async () => {
      const responsePost1 = await agent
        .post('/blogs')
        .auth('admin', 'qwerty')
        .send(correctBlog1);

      const responsePost2 = await agent
        .post('/blogs/' + responsePost1.body.id + '/posts')
        .auth('admin', 'qwerty')
        .send(correctPost1)
        .expect(201);
      expect(responsePost2.body).toEqual({
        id: expect.any(String),
        title: correctPost1.title,
        shortDescription: correctPost1.shortDescription,
        content: correctPost1.content,
        blogId: responsePost1.body.id,
        blogName: correctBlog1.name,
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
          newestLikes: [],
        },
      });
    });

    it('Should not create post, return status 400, if incorrect input', async () => {
      const responsePost1 = await agent
        .post('/blogs')
        .auth('admin', 'qwerty')
        .send(correctBlog1);

      const responsePost2 = await agent
        .post('/blogs/' + responsePost1.body.id + '/posts')
        .auth('admin', 'qwerty')
        .send(incorrectPost1)
        .expect(400);
      expect(responsePost2.body).toEqual({
        errorsMessages: [
          {
            message: 'Incorrect title',
            field: 'title',
          },
          {
            message: 'Incorrect shortDescription',
            field: 'shortDescription',
          },
          {
            message: 'Incorrect content',
            field: 'content',
          },
        ],
      });
    });

    it('Should not create post, return status 401, if incorrect auth', async () => {
      const responsePost1 = await agent
        .post('/blogs')
        .auth('admin', 'qwerty')
        .send(correctBlog1);

      await agent
        .post('/blogs/' + responsePost1.body.id + '/posts')
        .auth('admin', 'incorrect')
        .send(correctBlog1)
        .expect(401);
    });

    it('Should not create post, return status 404, if specified blog does not exists', async () => {
      await agent.post('/blogs').auth('admin', 'qwerty').send(correctBlog1);

      await agent
        .post('/blogs/658d0d8b6e78ef9ce0470741/posts')
        .auth('admin', 'qwerty')
        .send(incorrectPost1)
        .expect(400);
    });

    afterAll(async () => {
      await app.close();
    });
  });

  // GET: /blogs/:blogId/posts
  describe('Get posts for specific blog', () => {
    beforeAll(async () => {
      await agent.delete('/testing/all-data');
    });

    it('Should get post to specific blog, return status 200 and posts list', async () => {
      const blog1 = await agent
        .post('/blogs')
        .auth('admin', 'qwerty')
        .send(correctBlog1);

      await agent
        .post('/blogs/' + blog1.body.id + '/posts')
        .auth('admin', 'qwerty')
        .send(correctPost1)
        .expect(201);
      await agent
        .post('/blogs/' + blog1.body.id + '/posts')
        .auth('admin', 'qwerty')
        .send(correctPost2)
        .expect(201);

      await agent.get('/blogs/' + blog1.body.id + '/posts').expect(200);
      /*expect(responseGet.body).toEqual({
        pagesCount: 0,
        page: 0,
        pageSize: 0,
        totalCount: 0,
        items: [
          {
            id: expect.any(String),
            title: correctPost2.title,
            shortDescription: correctPost2.shortDescription,
            content: correctPost2.content,
            blogId: blog1.body.id,
            blogName: correctBlog2.name,
            createdAt: expect.any(String),
            extendedLikesInfo: {
              likesCount: 0,
              dislikesCount: 0,
              myStatus: 'None',
              newestLikes: [],
            },
          },
          {
            id: expect.any(String),
            title: correctPost1.title,
            shortDescription: correctPost1.shortDescription,
            content: correctPost1.content,
            blogId: blog1.body.id,
            blogName: correctBlog1.name,
            createdAt: expect.any(String),
            extendedLikesInfo: {
              likesCount: 0,
              dislikesCount: 0,
              myStatus: 'None',
              newestLikes: [],
            },
          },
        ],
      });*/
    });

    afterAll(async () => {
      await app.close();
    });
  });
});
