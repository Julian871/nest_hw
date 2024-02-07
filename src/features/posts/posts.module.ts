import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthService } from '../../security/auth-service';
import { UsersService } from '../users/application/users-service';
import { JwtService } from '@nestjs/jwt';
import { CreatePostCommentUseCase } from './application/use-cases/create-post-comment-use-case';
import { CreatePostUseCase } from './application/use-cases/create-post-use-case';
import { DeletePostUseCase } from './application/use-cases/delete-post-use-case';
import { GetAllPostCommentUseCase } from './application/use-cases/get-all-post-comments-use-case';
import { GetAllPostsUseCase } from './application/use-cases/get-all-posts-use-case';
import { GetPostByIdUseCase } from './application/use-cases/get-post-by-id-use-case';
import { UpdatePostUseCase } from './application/use-cases/update-post-use-case';
import { PostsController } from './api/posts.controllers';
import { UsersModule } from '../users/users.module';
import { LikesCommentsService } from '../likes/application/likes-comment-service';
import { LikesPostService } from '../likes/application/likes-post-service';
import { CommentsModule } from '../comments/comments.module';
import { GetBlogByIdUseCase } from '../blogs/application/use-cases/get-blog-by-id-use-case';
import { IsBlogExistConstraint } from './application/blogId.exist';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostLike } from '../../entities/post-like-entity';
import { CommentLike } from '../../entities/comment-like-entity';
import { Comment } from '../../entities/comment-entity';
import { UpdatePostLikeStatusUseCase } from '../likes/application/use-cases/update-post-like-status-use-case';
import { UsersRepo } from '../users/infrastructure/users-repo';
import { UsersQueryRepo } from '../users/infrastructure/users-query-repo';
import { PostsQueryRepo } from './infrastructure/post-query-repo';
import { PostsRepo } from './infrastructure/post-repo';
import { BlogsRepo } from '../blogs/infrastructure/blogs-repo';
import { BlogsQueryRepo } from '../blogs/infrastructure/blogs-query-repo';
import { Post } from '../../entities/post-entity';
import { SessionRepo } from '../devices/infrastructure/session-repo';
import { CommentsRepo } from '../comments/infrastructure/comments-repo';
import { Repository } from 'typeorm';
import { BlogsModule } from '../blogs/blogs.module';
import { DevicesModule } from '../devices/devices.module';
import { CommentsQueryRepo } from '../comments/infrastructure/comments-query-repo';

const services = [
  AuthService,
  JwtService,
  UsersService,
  LikesCommentsService,
  LikesPostService,
];
const repositories = [
  UsersRepo,
  UsersQueryRepo,
  PostsRepo,
  BlogsRepo,
  PostsQueryRepo,
  BlogsQueryRepo,
  SessionRepo,
  CommentsRepo,
  CommentsQueryRepo,
  Repository,
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
  UpdatePostLikeStatusUseCase,
];

const Entity = [Post, PostLike, CommentLike, Comment];

@Module({
  imports: [
    CqrsModule,
    UsersModule,
    CommentsModule,
    BlogsModule,
    DevicesModule,
    TypeOrmModule.forFeature([...Entity]),
  ],
  providers: [...services, ...repositories, ...useCases, IsBlogExistConstraint],
  controllers: [PostsController],
  exports: [TypeOrmModule],
})
export class PostsModule {}
