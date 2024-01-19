import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthService } from '../../security/auth-service';
import { JwtService } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/application/users-service';
import { UsersRepository } from '../users/infrastructure/users-repository';
import { SessionRepository } from '../devices/infrastructure/session-repository';
import { EmailManager } from '../../email/email-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from '../posts/post-entity';
import { CommentLikeEntity } from '../likes/comment-like-entity';
import { CommentEntity } from './comment-entity';

const services = [AuthService, JwtService, UsersService];
const repositories = [UsersRepository, SessionRepository];
const useCases = [];
const entities = [PostEntity, CommentLikeEntity, CommentEntity];

@Module({
  imports: [CqrsModule, UsersModule, TypeOrmModule.forFeature([...entities])],
  providers: [...services, ...repositories, ...useCases, EmailManager],
  controllers: [],
  exports: [TypeOrmModule],
})
export class CommentsModule {}
