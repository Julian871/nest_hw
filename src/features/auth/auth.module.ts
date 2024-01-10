import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UsersModule } from '../users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsModule } from '../posts/posts.module';
import { EmailManager } from '../../email/email-manager';
import { AuthController } from './api/auth.controller';
import { SessionRepository } from '../devices/infrastructure/session-repository';
import { AuthService } from '../../security/auth-service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/application/users-service';
import { UsersRepository } from '../users/infrastructure/users-repository';
import { ConnectionRepository } from '../connection/connection-repository';
import { Connection, ConnectionSchema } from '../connection/connection-schema';
import { SessionService } from '../devices/application/session-service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../users/user-entity';
import { ThrottlerModule } from '@nestjs/throttler';
import { RegistrationUserUseCase } from './registration-user-use-cases';

const services = [AuthService, JwtService, UsersService, SessionService];
const repositories = [SessionRepository, UsersRepository, ConnectionRepository];
const useCases = [RegistrationUserUseCase];

@Module({
  imports: [
    CqrsModule,
    UsersModule,
    MongooseModule.forFeature([
      {
        name: Connection.name,
        schema: ConnectionSchema,
      },
    ]),
    TypeOrmModule.forFeature([UserEntity]),
    ThrottlerModule.forRoot([
      {
        ttl: 10000,
        limit: 5,
      },
    ]),
  ],
  providers: [...services, ...repositories, ...useCases, EmailManager],
  controllers: [AuthController],
  exports: [MongooseModule],
})
export class AuthModule {}
