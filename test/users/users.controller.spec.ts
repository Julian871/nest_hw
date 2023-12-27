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
import { correctUser1, incorrectUser1 } from './input-model';

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

  describe('Create user', () => {
    it('Should create user, return status 201 and user information', async () => {
      const response = await agent
        .post('/users')
        .auth('admin', 'qwerty')
        .send(correctUser1)
        .expect(201);
      expect(response.body).toEqual({
        id: expect.any(String),
        login: correctUser1.login,
        email: correctUser1.email,
        createdAt: expect.any(String),
      });
    });

    it('Should not create user, if this login or email already exists, return status 400', async () => {
      await agent
        .post('/users')
        .auth('admin', 'qwerty')
        .send(correctUser1)
        .expect(400);
    });

    it('Should not create user, if input values incorrect. Return status 400 and errorsMessages', async () => {
      const response = await agent
        .post('/users')
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
        .post('/users')
        .auth('admin', 'incorrect')
        .send(incorrectUser1)
        .expect(401);
    });
  });

  describe('Get user', () => {
    it('Should get list of users', async () => {
      const response = await agent
        .post('/users')
        .auth('admin', 'qwerty')
        .send(correctUser1)
        .expect(201);
      expect(response.body).toEqual({
        id: expect.any(String),
        login: correctUser1.login,
        email: correctUser1.email,
        createdAt: expect.any(String),
      });

      await agent.get('/users');
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
