import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import supertest, { SuperAgentTest } from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/exeption-filter';
import { useContainer } from 'class-validator';
import {
  correctLoginUser1,
  correctUser1,
  expireRefreshToken,
  expireToken,
  incorrectUser1,
} from './input-models/users-input-model';
import cookieParser from 'cookie-parser';
import { sleep } from './input-models/auth-input-model';

describe('Auth testing', () => {
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
    let login: any;
    let refreshToken: any;
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
        userId: expect.any(Number),
        login: correctUser1.login,
        email: correctUser1.email,
      });
    });

    it('Should not get my status, if auth incorrect 401', async () => {
      await agent
        .get('/auth/me')
        .auth(expireToken, {
          type: 'bearer',
        })
        .expect(401);
    });

    it('Should not get me, after logout', async () => {
      login = await agent
        .post('/auth/login')
        .send(correctLoginUser1)
        .expect(200);
      refreshToken = login.headers['set-cookie'][0];
      await agent.post('/auth/logout').set('cookie', refreshToken).expect(204);
      await agent.get('/auth/me').set('cookie', refreshToken).expect(401);
    });
  });

  // POST: /auth/refresh-token
  describe('Refresh-token', () => {
    beforeAll(async () => {
      await agent.delete('/testing/all-data');
    });
    let login: any;
    let refreshToken: any;

    it('Should register user, return status 204', async () => {
      await agent.post('/auth/registration').send(correctUser1).expect(204);
      login = await agent
        .post('/auth/login')
        .send(correctLoginUser1)
        .expect(200);
      refreshToken = login.headers['set-cookie'][0];
      console.log('token', refreshToken);
    });

    it('Should refresh token', async () => {
      refreshToken = await agent
        .post('/auth/refresh-token')
        .set('cookie', refreshToken)
        .expect(200);
    });

    it('Should not refresh token, if token expired', async () => {
      await agent
        .post('/auth/refresh-token')
        .set('cookie', expireRefreshToken)
        .expect(401);
    });

    it('Should not refresh token, after logout', async () => {
      login = await agent
        .post('/auth/login')
        .send(correctLoginUser1)
        .expect(200);
      refreshToken = login.headers['set-cookie'][0];
      await agent.post('/auth/logout').set('cookie', refreshToken).expect(204);
      await agent
        .post('/auth/refresh-token')
        .set('cookie', refreshToken)
        .expect(401);
    });
  });

  // POST: /auth/refresh-token with delete devices
  describe('Refresh-token - devices', () => {
    beforeAll(async () => {
      await agent.delete('/testing/all-data');
    });
    let login: any;
    let login2: any;
    let refreshToken1: any;
    let refreshToken2: any;
    let session: any;
    let session2: any;

    it('Should register user, return status 204', async () => {
      await agent
        .post('/sa/users')
        .auth('admin', 'qwerty')
        .send(correctUser1)
        .expect(201);
      login = await agent
        .post('/auth/login')
        .set('user-agent', 'device1')
        .send(correctLoginUser1)
        .expect(200);
      refreshToken1 = login.headers['set-cookie'][0];
      login2 = await agent
        .post('/auth/login')
        .set('user-agent', 'device2')
        .send(correctLoginUser1)
        .expect(200);
      refreshToken2 = login2.headers['set-cookie'][0];
    });

    it('RefreshToken after delete device by id', async () => {
      session = await agent
        .get('/security/devices')
        .set('cookie', refreshToken2)
        .expect(200);
      expect(session.body).toHaveLength(2);
      console.log({ devices_2: session.body });

      await agent
        .delete('/security/devices/' + session.body[1].deviceId)
        .set('Cookie', refreshToken2)
        .expect(204);

      session2 = await agent
        .get('/security/devices')
        .set('cookie', refreshToken1)
        .expect(200);
      expect(session2.body).toHaveLength(1);
      console.log({ device_1: session2.body });

      await agent
        .post('/auth/refresh-token')
        .set('cookie', refreshToken2)
        .expect(401);

      await agent
        .delete('/security/devices/' + session2.body[0].deviceId)
        .set('Cookie', refreshToken1)
        .expect(204);

      await agent
        .post('/auth/refresh-token')
        .set('cookie', refreshToken1)
        .expect(401);
    });
  });

  // POST: /auth/login
  describe('Login', () => {
    beforeAll(async () => {
      await agent.delete('/testing/all-data');
    });
    let login: any;

    it('Should login user, return status 200', async () => {
      await agent.post('/auth/registration').send(correctUser1).expect(204);
      login = await agent
        .post('/auth/login')
        .send(correctLoginUser1)
        .expect(200);
    });

    it('Should not login user, if input values incorrect', async () => {
      await agent.post('/auth/login').send(incorrectUser1).expect(400);
    });

    it('Should not login user, if password incorrect', async () => {
      await agent
        .post('/auth/login')
        .send({ loginOrEmail: 'someLogin', password: 'incorrect' })
        .expect(401);
    });
  });

  describe('Login 4 times and get devices', () => {
    jest.setTimeout(10000);
    beforeAll(async () => {
      await agent.delete('/testing/all-data');
    });

    let token: string = '';

    it('Should login user, return status 200', async () => {
      await agent.post('/auth/registration').send(correctUser1).expect(204);
      await agent
        .post('/auth/login')
        .send(correctLoginUser1)
        .set('user-agent', 'browser1')
        .expect(200);

      await agent
        .post('/auth/login')
        .send(correctLoginUser1)
        .set('user-agent', 'browser2')
        .expect(200);

      await agent
        .post('/auth/login')
        .send(correctLoginUser1)
        .set('user-agent', 'browser3')
        .expect(200);

      const login = await agent
        .post('/auth/login')
        .send(correctLoginUser1)
        .set('user-agent', 'browser4')
        .expect(200);
      token = login.headers['set-cookie'][0];
    });

    it('Should get 4 session', async () => {
      await sleep(1000);
      const session = await agent
        .get('/security/devices')
        .set('Cookie', token)
        .expect(200);
      expect(session.body).toHaveLength(4);
    });
  });

  // POST: /auth/logout
  describe('Logout', () => {
    beforeAll(async () => {
      await agent.delete('/testing/all-data');
    });
    let login: any;
    let refreshToken: any;

    it('Should login user, return status 200', async () => {
      await agent.post('/auth/registration').send(correctUser1).expect(204);
      login = await agent
        .post('/auth/login')
        .send(correctLoginUser1)
        .expect(200);
      refreshToken = login.headers['set-cookie'][0];
    });

    it('Should not logout if token expired', async () => {
      await agent
        .post('/auth/logout')
        .set('cookie', expireRefreshToken)
        .expect(401);
    });

    it('Should logout', async () => {
      await agent
        .post('/auth/logout')
        .set('cookie', expireRefreshToken)
        .expect(401);
      await agent.post('/auth/logout').set('cookie', refreshToken).expect(204);
    });
  });
});
