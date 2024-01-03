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
import cookieParser from 'cookie-parser';
import { useContainer } from 'class-validator';
import {
  correctLoginUser1,
  correctLoginUser2,
  correctUser1,
  correctUser2,
  expireRefreshToken,
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

    let token: any;

    it('Should register and login 2 new user', async () => {
      await agent
        .post('/users')
        .auth('admin', 'qwerty')
        .send(correctUser1)
        .expect(201);
      await agent.post('/auth/login').send(correctLoginUser1).expect(200);

      await agent
        .post('/users')
        .auth('admin', 'qwerty')
        .send(correctUser2)
        .expect(201);
      const user2 = await agent
        .post('/auth/login')
        .send(correctLoginUser2)
        .expect(200);
      token = user2.headers['set-cookie'][0];
    });

    it('Should get device session', async () => {
      const session = await agent
        .get('/security/devices')
        .set('cookie', token)
        .expect(200);
      expect(session.body).toEqual([
        {
          ip: expect.any(String),
          title: expect.any(String),
          lastActiveDate: expect.any(String),
          deviceId: expect.any(String),
        },
      ]);
    });

    it('Should not get device session, if auth incorrect', async () => {
      await agent
        .get('/security/devices')
        .set('cookie', expireRefreshToken)
        .expect(401);
    });
  });

  // DELELETE: /security/devices/deviceID
  describe('Delete devices', () => {
    beforeAll(async () => {
      await agent.delete('/testing/all-data');
    });
    let user2: any;
    let tokenUser2: any;

    it('Should register and login new user', async () => {
      await agent
        .post('/users')
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
        .get('/security/devices')
        .set('cookie', expireRefreshToken)
        .expect(401);
    });

    it('Should delete device', async () => {
      await agent
        .delete('/security/devices/')
        .set('cookie', tokenUser2)
        .expect(204);
    });

    it('Should return 401, after delete device', async () => {
      await agent
        .delete('/security/devices/')
        .set('cookie', tokenUser2)
        .expect(401);
    });
  });

  // DELELETE: /security/devices/deviceID
  describe('Delete device by id', () => {
    beforeAll(async () => {
      await agent.delete('/testing/all-data');
    });

    let user1: any;
    let user2: any;
    let tokenUser2: any;
    let tokenUser1: any;
    let session: any;

    it('Should register and login 2 new user', async () => {
      await agent
        .post('/users')
        .auth('admin', 'qwerty')
        .send(correctUser1)
        .expect(201);
      user1 = await agent
        .post('/auth/login')
        .send(correctLoginUser1)
        .expect(200);
      tokenUser1 = user1.headers['set-cookie'][0];

      await agent
        .post('/users')
        .auth('admin', 'qwerty')
        .send(correctUser2)
        .expect(201);
      user2 = await agent
        .post('/auth/login')
        .send(correctLoginUser2)
        .expect(200);
      tokenUser2 = user2.headers['set-cookie'][0];
      session = await agent
        .get('/security/devices')
        .set('cookie', tokenUser2)
        .expect(200);
    });

    it('Should not delete device if id incorrect', async () => {
      await agent
        .delete('/security/devices/08ee8a1c-ea38-4359-889e-62850c75d2f5')
        .set('Cookie', tokenUser2)
        .expect(404);
    });

    it('Should not delete if try to delete the deviceId of other user', async () => {
      console.log('session: ', session);
      await agent
        .delete('/security/devices/' + 'deviceId2')
        .set('cookie', tokenUser1)
        .expect(403);
    });

    it('Should not delete device if auth incorrect', async () => {
      await agent
        .get('/security/devices' + 'deviceId2')
        .set('cookie', expireRefreshToken)
        .expect(401);
    });

    it('Should delete device by id', async () => {
      await agent
        .delete('/security/devices/' + 'deviceId2')
        .set('cookie', tokenUser2)
        .expect(204);
      await agent
        .get('/security/devices')
        .set('cookie', tokenUser2)
        .expect(404);
    });
  });
});
