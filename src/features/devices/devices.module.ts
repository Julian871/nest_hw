import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from '../../security/auth-service';
import { JwtService } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/application/users-service';
import { UsersRepository } from '../users/infrastructure/users-repository';
import { SessionRepository } from '../devices/session/session-repository';
import { Session, SessionSchema } from './session/session-schema';
import { EmailManager } from '../../email/email-manager';
import { DevicesController } from './api/devices.controllers';
import { SessionService } from './session/session-service';

const services = [AuthService, JwtService, UsersService, SessionService];
const repositories = [UsersRepository, SessionRepository];
const useCases = [];

@Module({
  imports: [
    CqrsModule,
    UsersModule,
    MongooseModule.forFeature([
      {
        name: Session.name,
        schema: SessionSchema,
      },
    ]),
  ],
  providers: [...services, ...repositories, ...useCases, EmailManager],
  controllers: [DevicesController],
  exports: [MongooseModule],
})
export class DevicesModule {}
