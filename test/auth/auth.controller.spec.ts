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
import { useContainer } from 'class-validator';
import {
  correctLoginUser1,
  correctUser1,
  expireToken,
  incorrectUser1,
} from '../users/users-input-model';

describe('Auth testing', () => {
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
    useContainer(app.select(AppModule), { fallbackOnErrors: true });

    await app.init();

    agent = supertest.agent(app.getHttpServer());

    await agent.delete('/testing/all-data');
  });
  afterAll(async () => {
    await app.close();
  });

  // POST: /auth/registration
  describe('Register user', () => {
    beforeAll(async () => {
      await agent.delete('/testing/all-data');
    });

    it('Should register user, return status 204', async () => {
      await agent.post('/auth/registration').send(correctUser1).expect(204);
    });

    it('Should not register user, if incorrect input values return status 400', async () => {
      const registerUser = await agent
        .post('/auth/registration')
        .send(incorrectUser1)
        .expect(400);
      expect(registerUser.body).toEqual({
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
  });

  // GET: /auth/me
  describe('Get me', () => {
    beforeAll(async () => {
      await agent.delete('/testing/all-data');
    });
    let token: any;

    it('Should register user, return status 204', async () => {
      await agent.post('/auth/registration').send(correctUser1).expect(204);
      token = await agent
        .post('/auth/login')
        .send(correctLoginUser1)
        .expect(200);
    });

    it('Should get my status, return status 200', async () => {
      const myInfo = await agent
        .get('/auth/me')
        .auth(token.body.accessToken, {
          type: 'bearer',
        })
        .expect(200);
      expect(myInfo.body).toEqual({
        userId: expect.any(String),
        login: correctUser1.login,
        email: correctUser1.email,
      });
    });

    it('Should not get my status, if auth incorrect 401', async () => {
      const myInfo = await agent
        .get('/auth/me')
        .auth(expireToken, {
          type: 'bearer',
        })
        .expect(401);
    });
  });

  // POST: /auth/refresh-token
  describe('Refresh-token', () => {
    beforeAll(async () => {
      await agent.delete('/testing/all-data');
    });
    let login: any;
    let refreshToken: any;
    let newToken: any;

    it('Should register user, return status 204', async () => {
      await agent.post('/auth/registration').send(correctUser1).expect(204);
      login = await agent
        .post('/auth/login')
        .send(correctLoginUser1)
        .expect(200);
      refreshToken = login.headers['set-cookie'][0];
    });

    it('Should refresh token', async () => {
      newToken = await agent
        .post('/auth/refresh-token')
        .set('cookie', refreshToken)
        .expect(200);
    });
  });
});
