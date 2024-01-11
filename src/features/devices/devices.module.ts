import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthService } from '../../security/auth-service';
import { JwtService } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/application/users-service';
import { UsersRepository } from '../users/infrastructure/users-repository';
import { SessionRepository } from './infrastructure/session-repository';
import { EmailManager } from '../../email/email-manager';
import { DevicesController } from './api/devices.controllers';
import { SessionService } from './application/session-service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionEntity } from './session-entity';

const services = [AuthService, JwtService, UsersService, SessionService];
const repositories = [UsersRepository, SessionRepository];
const useCases = [];

@Module({
  imports: [CqrsModule, UsersModule, TypeOrmModule.forFeature([SessionEntity])],
  providers: [...services, ...repositories, ...useCases, EmailManager],
  controllers: [DevicesController],
  exports: [TypeOrmModule],
})
export class DevicesModule {}
