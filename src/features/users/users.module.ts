import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './users-schema';
import { UsersService } from './application/users-service';
import { AuthService } from '../../security/auth-service';
import { EmailManager } from '../../email/email-manager';
import { UsersRepository } from './infrastructure/users-repository';
import { UsersController } from './api/users.controller';
import { SessionRepository } from '../devices/session/session-repository';
import { JwtService } from '@nestjs/jwt';
import { Session, SessionSchema } from '../devices/session/session-schema';
import { CreateUserUseCase } from './application/use-cases/create-user-use-case';
import { DeleteUserUseCase } from './application/use-cases/delete-user-use-case';
import { GetUsersUseCase } from './application/use-cases/get-users-use-case';

const services = [UsersService, AuthService, JwtService];
const repositories = [UsersRepository, SessionRepository];
const useCases = [CreateUserUseCase, DeleteUserUseCase, GetUsersUseCase];

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Session.name,
        schema: SessionSchema,
      },
    ]),
  ],
  providers: [...services, ...repositories, ...useCases, EmailManager],
  controllers: [UsersController],
  exports: [MongooseModule],
})
export class UsersModule {}
