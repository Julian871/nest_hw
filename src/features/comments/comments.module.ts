import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthService } from '../../security/auth-service';
import { JwtService } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/application/users-service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '../../entities/post-entity';
import { CommentLike } from '../../entities/comment-like-entity';
import { Comment } from '../../entities/comment-entity';
import { CommentsController } from './api/comments.controllers';
import { GetCommentUseCase } from './application/use-cases/get-comment-use-case';
import { UpdateCommentUseCase } from './application/use-cases/update-comment-use-case';
import { CommentsService } from './application/comments-service';
import { LikesCommentsService } from '../likes/application/likes-comment-service';
import { UpdateCommentLikeStatusUseCase } from '../likes/application/use-cases/update-comment-like-status-use-case';
import { UsersRepo } from '../users/infrastructure/users-repo';
import { UsersQueryRepo } from '../users/infrastructure/users-query-repo';
import { SessionRepo } from '../devices/infrastructure/session-repo';
import { CommentsRepo } from './infrastructure/comments-repo';
import { DevicesModule } from '../devices/devices.module';
import { Repository } from 'typeorm';

const services = [
  AuthService,
  JwtService,
  UsersService,
  CommentsService,
  LikesCommentsService,
];
const repositories = [
  SessionRepo,
  UsersRepo,
  UsersQueryRepo,
  CommentsRepo,
  Repository,
];
const useCases = [
  GetCommentUseCase,
  UpdateCommentUseCase,
  UpdateCommentLikeStatusUseCase,
];
const entities = [Post, CommentLike, Comment];

@Module({
  imports: [
    CqrsModule,
    UsersModule,
    DevicesModule,
    TypeOrmModule.forFeature([...entities]),
  ],
  providers: [...services, ...repositories, ...useCases],
  controllers: [CommentsController],
  exports: [TypeOrmModule],
})
export class CommentsModule {}
