import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from '../../security/auth-service';
import { JwtService } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { Comment, CommentSchema } from './comments-schema';
import { UsersService } from '../users/application/users-service';
import { UsersRepository } from '../users/infrastructure/users-repository';
import { SessionRepository } from '../devices/session/session-repository';
import { EmailManager } from '../../email/email-manager';

const services = [AuthService, JwtService, UsersService];
const repositories = [UsersRepository, SessionRepository];
const useCases = [];

@Module({
  imports: [
    CqrsModule,
    UsersModule,
    MongooseModule.forFeature([
      {
        name: Comment.name,
        schema: CommentSchema,
      },
    ]),
  ],
  providers: [...services, ...repositories, ...useCases, EmailManager],
  controllers: [],
  exports: [MongooseModule],
})
export class CommentsModule {}
