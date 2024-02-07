import { forwardRef, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthService } from '../../security/auth-service';
import { JwtService } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/application/users-service';
import { DevicesController } from './api/devices.controllers';
import { SessionService } from './application/session-service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from '../../entities/session-entity';
import { UsersRepo } from '../users/infrastructure/users-repo';
import { UsersQueryRepo } from '../users/infrastructure/users-query-repo';
import { SessionRepo } from './infrastructure/session-repo';

const services = [AuthService, JwtService, UsersService, SessionService];
const repositories = [UsersRepo, UsersQueryRepo, SessionRepo];
const useCases = [];

@Module({
  imports: [
    CqrsModule,
    forwardRef(() => UsersModule),
    TypeOrmModule.forFeature([Session]),
  ],
  providers: [...services, ...repositories, ...useCases],
  controllers: [DevicesController],
  exports: [TypeOrmModule],
})
export class DevicesModule {}
