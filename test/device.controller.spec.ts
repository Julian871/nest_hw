import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import supertest, { SuperAgentTest } from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/exeption-filter';
import cookieParser from 'cookie-parser';
import { useContainer } from 'class-validator';
import {
  correctLoginUser1,
  correctLoginUser2,
  correctUser1,
  correctUser2,
  expireRefreshToken,
} from './input-models/users-input-model';

describe('Device testing', () => {
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

  // GET: /security/devices
  describe('Get devices', () => {
    beforeAll(async () => {
      await agent.delete('/testing/all-data');
    });

    let login: any;
    let refreshToken2: any;

    it('Should register user and login 2 times', async () => {
      await agent
        .post('/sa/users')
        .auth('admin', 'qwerty')
        .send(correctUser1)
        .expect(201);
      login = await agent
        .post('/auth/login')
        .set('user-agent', 'dev1')
        .send(correctLoginUser1)
        .expect(200);
      await agent
        .post('/auth/login')
        .set('user-agent', 'dev2')
        .send(correctLoginUser1)
        .expect(200);
      refreshToken2 = login.headers['set-cookie'][0];
    });

    it('Should get device session', async () => {
      const session = await agent
        .get('/security/devices')
        .set('cookie', refreshToken2)
        .expect(200);
      expect(session.body).toHaveLength(2);
      console.log({ devices_2: session.body });
    });

    it('Should not get device session, if auth incorrect', async () => {
      await agent
        .get('/security/devices')
        .set('cookie', expireRefreshToken)
        .expect(401);
    });
  });

  // DELETE: /security/devices
  describe('Delete devices', () => {
    beforeAll(async () => {
      await agent.delete('/testing/all-data');
    });
    let user2: any;
    let tokenUser2: any;

    it('Should register and login new user', async () => {
      await agent
        .post('/sa/users')
        .auth('admin', 'qwerty')
        .send(correctUser2)
        .expect(201);
      user2 = await agent
        .post('/auth/login')
        .send(correctLoginUser2)
        .expect(200);
      tokenUser2 = user2.headers['set-cookie'][0];
    });

    it('Should not delete device if auth incorrect', async () => {
      await agent
        .delete('/security/devices')
        .set('cookie', expireRefreshToken)
        .expect(401);
    });

    it('Should delete devices', async () => {
      await agent
        .delete('/security/devices')
        .set('cookie', tokenUser2)
        .expect(204);
    });

    it('Should return 204, after delete devices', async () => {
      await agent
        .delete('/security/devices')
        .set('cookie', tokenUser2)
        .expect(204);
    });
  });

  // DELETE: /security/devices/deviceID
  describe('Delete device by id', () => {
    beforeAll(async () => {
      await agent.delete('/testing/all-data');
    });

    let user1: any;
    let user2: any;
    let tokenUser2: any;
    let tokenUser1: any;
    let session: any;
    let deviceId: any;

    it('Register and login new user2', async () => {
      await agent
        .post('/sa/users')
        .auth('admin', 'qwerty')
        .send(correctUser2)
        .expect(201);
      user2 = await agent
        .post('/auth/login')
        .send(correctLoginUser2)
        .expect(200);
      tokenUser2 = user2.headers['set-cookie'][0];
    });

    it('Get sessions', async () => {
      session = await agent
        .get('/security/devices')
        .set('cookie', tokenUser2)
        .expect(200);
      deviceId = session.body[0].deviceId;
    });

    it('Should not delete device if id incorrect', async () => {
      await agent
        .delete('/security/devices/08ee8a1c-ea38-4359-889e-62850c75d2f5')
        .set('Cookie', tokenUser2)
        .expect(404);
    });

    it('Register and login new user1', async () => {
      await agent
        .post('/sa/users')
        .auth('admin', 'qwerty')
        .send(correctUser1)
        .expect(201);
      user1 = await agent
        .post('/auth/login')
        .send(correctLoginUser1)
        .expect(200);
      tokenUser1 = user1.headers['set-cookie'][0];
    });

    it('Should not delete if try to delete the deviceId of other user', async () => {
      await agent
        .delete('/security/devices/' + deviceId)
        .set('cookie', tokenUser1)
        .expect(403);
    });

    it('Should not delete device if auth incorrect', async () => {
      await agent
        .delete('/security/devices/' + deviceId)
        .set('cookie', expireRefreshToken)
        .expect(401);
    });

    it('Should delete device by id', async () => {
      await agent
        .delete('/security/devices/' + deviceId)
        .set('cookie', tokenUser2)
        .expect(204);
      await agent
        .get('/security/devices/' + deviceId)
        .set('cookie', tokenUser2)
        .expect(404);
    });
  });
});
