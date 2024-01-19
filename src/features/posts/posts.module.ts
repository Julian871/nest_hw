import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthService } from '../../security/auth-service';
import { PostsRepository } from './infrastructure/posts-repository';
import { UsersService } from '../users/application/users-service';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from '../users/infrastructure/users-repository';
import { SessionRepository } from '../devices/infrastructure/session-repository';
import { EmailManager } from '../../email/email-manager';
import { CreatePostCommentUseCase } from './application/use-cases/create-post-comment-use-case';
import { CreatePostUseCase } from './application/use-cases/create-post-use-case';
import { DeletePostUseCase } from './application/use-cases/delete-post-use-case';
import { GetAllPostCommentUseCase } from './application/use-cases/get-all-post-comments-use-case';
import { GetAllPostsUseCase } from './application/use-cases/get-all-posts-use-case';
import { GetPostByIdUseCase } from './application/use-cases/get-post-by-id-use-case';
import { UpdatePostUseCase } from './application/use-cases/update-post-use-case';
import { PostsController } from './api/posts.controllers';
import { UsersModule } from '../users/users.module';
import { BlogsRepository } from '../blogs/infrastructure/blogs-repository';
import { LikesCommentsService } from '../likes/likes-comment-service';
import { CommentsRepository } from '../comments/infrastructure/comments-repository';
import { LikesPostService } from '../likes/likes-post-service';
import { CommentsModule } from '../comments/comments.module';
import { GetBlogByIdUseCase } from '../blogs/application/use-cases/get-blog-by-id-use-case';
import { IsBlogExistConstraint } from './application/blogId.exist';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from './post-entity';
import { PostLikeEntity } from '../likes/post-like-entity';
import { CommentLikeEntity } from '../likes/comment-like-entity';
import { CommentEntity } from '../comments/comment-entity';

const services = [
  AuthService,
  JwtService,
  UsersService,
  LikesCommentsService,
  LikesPostService,
];
const repositories = [
  PostsRepository,
  SessionRepository,
  UsersRepository,
  BlogsRepository,
  CommentsRepository,
];
const useCases = [
  CreatePostCommentUseCase,
  CreatePostUseCase,
  DeletePostUseCase,
  GetAllPostCommentUseCase,
  GetAllPostsUseCase,
  GetPostByIdUseCase,
  UpdatePostUseCase,
  GetBlogByIdUseCase,
];

const Entity = [PostEntity, PostLikeEntity, CommentLikeEntity, CommentEntity];

@Module({
  imports: [
    CqrsModule,
    UsersModule,
    CommentsModule,
    TypeOrmModule.forFeature([...Entity]),
  ],
  providers: [
    ...services,
    ...repositories,
    ...useCases,
    EmailManager,
    IsBlogExistConstraint,
  ],
  controllers: [PostsController],
  exports: [TypeOrmModule],
})
export class PostsModule {}
