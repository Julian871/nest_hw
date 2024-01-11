import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UsersService } from './application/users-service';
import { AuthService } from '../../security/auth-service';
import { EmailManager } from '../../email/email-manager';
import { UsersRepository } from './infrastructure/users-repository';
import { UsersController } from './api/users.controller';
import { SessionRepository } from '../devices/infrastructure/session-repository';
import { JwtService } from '@nestjs/jwt';
import { CreateUserUseCase } from './application/use-cases/create-user-use-case';
import { DeleteUserUseCase } from './application/use-cases/delete-user-use-case';
import { GetUsersUseCase } from './application/use-cases/get-users-use-case';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user-entity';

const services = [UsersService, AuthService, JwtService];
const repositories = [UsersRepository, SessionRepository];
const useCases = [CreateUserUseCase, DeleteUserUseCase, GetUsersUseCase];

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([UserEntity])],
  providers: [...services, ...repositories, ...useCases, EmailManager],
  controllers: [UsersController],
  exports: [TypeOrmModule],
})
export class UsersModule {}
