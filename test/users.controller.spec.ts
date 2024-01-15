import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import supertest, { SuperAgentTest } from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/exeption-filter';
import {
  correctUser1,
  correctUser2,
  incorrectUser1,
} from './input-models/users-input-model';
import cookieParser from 'cookie-parser';

describe('Users testing', () => {
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
    app.use(cookieParser());
    await app.init();

    agent = supertest.agent(app.getHttpServer());

    await agent.delete('/testing/all-data');
  });
  afterAll(async () => {
    await app.close();
  });

  // POST: /users
  describe('Create user', () => {
    beforeAll(async () => {
      await agent.delete('/testing/all-data');
    });

    it('Should create user, return status 201 and user information', async () => {
      const response = await agent
        .post('/sa/users')
        .auth('admin', 'qwerty')
        .send(correctUser1);
      expect(response.body).toEqual({
        id: expect.any(String),
        login: correctUser1.login,
        email: correctUser1.email,
        createdAt: expect.any(String),
      });
    });

    it('Should not create user, if this login or email already exists, return status 400', async () => {
      await agent
        .post('/sa/users')
        .auth('admin', 'qwerty')
        .send(correctUser1)
        .expect(400);
    });

    it('Should not create user, if input values incorrect. Return status 400 and errorsMessages', async () => {
      const response = await agent
        .post('/sa/users')
        .auth('admin', 'qwerty')
        .send(incorrectUser1)
        .expect(400);
      expect(response.body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'login',
          },
          {
            message: expect.any(String),
            field: 'password',
          },
          {
            message: expect.any(String),
            field: 'email',
          },
        ],
      });
    });

    it('Should not create user, if incorrect auth data. Return status 401', async () => {
      await agent
        .post('/sa/users')
        .auth('admin', 'incorrect')
        .send(incorrectUser1)
        .expect(401);
    });
  });

  // GET: /users
  describe('Get users', () => {
    beforeAll(async () => {
      await agent.delete('/testing/all-data');
    });

    it('Should get list of users, status 200', async () => {
      const response = await agent
        .post('/sa/users')
        .auth('admin', 'qwerty')
        .send(correctUser1)
        .expect(201);
      expect(response.body).toEqual({
        id: expect.any(String),
        login: correctUser1.login,
        email: correctUser1.email,
        createdAt: expect.any(String),
      });
      const response2 = await agent
        .post('/sa/users')
        .auth('admin', 'qwerty')
        .send(correctUser2)
        .expect(201);
      expect(response2.body).toEqual({
        id: expect.any(String),
        login: correctUser2.login,
        email: correctUser2.email,
        createdAt: expect.any(String),
      });
      const responseGet = await agent
        .get('/sa/users')
        .auth('admin', 'qwerty')
        .expect(200);
      expect(responseGet.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: [
          {
            id: expect.any(String),
            login: correctUser2.login,
            email: correctUser2.email,
            createdAt: expect.any(String),
          },
          {
            id: expect.any(String),
            login: correctUser1.login,
            email: correctUser1.email,
            createdAt: expect.any(String),
          },
        ],
      });
    });

    it('Should not get user, if incorrect auth data. Return status 401', async () => {
      await agent.get('/sa/users').auth('admin', 'incorrect').expect(401);
    });
  });

  // DELETE: /blogs/:id
  describe('Delete user by id', () => {
    beforeAll(async () => {
      await agent.delete('/testing/all-data');
    });

    it('Should delete users by id, status 200', async () => {
      const response = await agent
        .post('/sa/users')
        .auth('admin', 'qwerty')
        .send(correctUser1)
        .expect(201);
      expect(response.body).toEqual({
        id: expect.any(String),
        login: correctUser1.login,
        email: correctUser1.email,
        createdAt: expect.any(String),
      });
      await agent
        .delete('/sa/users/' + response.body.id)
        .auth('admin', 'qwerty')
        .expect(204);
      const responseGet = await agent
        .get('/sa/users')
        .auth('admin', 'qwerty')
        .expect(200);
      expect(responseGet.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
    });

    it('Should not delete user, if incorrect auth data. Return status 401', async () => {
      await agent
        .delete('/sa/users/anyId')
        .auth('admin', 'incorrect')
        .expect(401);
    });

    it('Should not delete user, if specified user is not exists. Return status 401', async () => {
      await agent
        .delete('/sa/users/658d153438c7b301a4707f40')
        .auth('admin', 'qwerty')
        .expect(404);
    });
  });
});
