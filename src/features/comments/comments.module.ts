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
import { CommentsController } from './api/comments.controllers';
import { GetCommentUseCase } from './application/use-cases/get-comment-use-case';
import { UpdateCommentUseCase } from './application/use-cases/update-comment-use-case';
import { CommentsService } from './application/comments-service';
import { CommentsRepository } from './infrastructure/comments-repository';
import { LikesCommentsService } from '../likes/likes-comment-service';

const services = [
  AuthService,
  JwtService,
  UsersService,
  CommentsService,
  LikesCommentsService,
];
const repositories = [UsersRepository, SessionRepository, CommentsRepository];
const useCases = [GetCommentUseCase, UpdateCommentUseCase];
const entities = [PostEntity, CommentLikeEntity, CommentEntity];

@Module({
  imports: [CqrsModule, UsersModule, TypeOrmModule.forFeature([...entities])],
  providers: [...services, ...repositories, ...useCases, EmailManager],
  controllers: [CommentsController],
  exports: [TypeOrmModule],
})
export class CommentsModule {}
