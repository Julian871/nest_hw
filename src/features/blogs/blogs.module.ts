import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UsersModule } from '../users/users.module';
import { BlogsService } from './application/blogs-service';
import { CreateBlogUseCase } from './application/use-cases/create-blog-use-case';
import { CreatePostToBlogUseCase } from './application/use-cases/create-post-to-blog-use-case';
import { DeleteBlogUseCase } from './application/use-cases/delete-blog-use-case';
import { GetBlogByIdUseCase } from './application/use-cases/get-blog-by-id-use-case';
import { GetBlogsUseCase } from './application/use-cases/get-blogs-use-case';
import { GetPostsToBlogUseCase } from './application/use-cases/get-posts-to-blog-use-case';
import { UpdateBlogUseCase } from './application/use-cases/update-blog-use-case';
import { BlogsController } from './api/blogs.controller';
import { LikesPostService } from '../likes/application/likes-post-service';
import { AuthService } from '../../security/auth-service';
import { UsersService } from '../users/application/users-service';
import { JwtService } from '@nestjs/jwt';
import { CommentsModule } from '../comments/comments.module';
import { SaBlogsController } from './api/sa.blogs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blog } from '../../entities/blog-entity';
import { UsersRepo } from '../users/infrastructure/users-repo';
import { UsersQueryRepo } from '../users/infrastructure/users-query-repo';
import { BlogsRepo } from './infrastructure/blogs-repo';
import { BlogsQueryRepo } from './infrastructure/blogs-query-repo';
import { PostsQueryRepo } from '../posts/infrastructure/post-query-repo';
import { PostsRepo } from '../posts/infrastructure/post-repo';
import { SessionRepo } from '../devices/infrastructure/session-repo';
import { Repository } from 'typeorm';
import { DevicesModule } from '../devices/devices.module';
import { PostLike } from '../../entities/post-like-entity';

const services = [
  BlogsService,
  LikesPostService,
  AuthService,
  UsersService,
  JwtService,
];
const repositories = [
  BlogsRepo,
  BlogsQueryRepo,
  PostsRepo,
  PostsQueryRepo,
  SessionRepo,
  UsersRepo,
  UsersQueryRepo,
  Repository,
];
const useCases = [
  CreateBlogUseCase,
  CreatePostToBlogUseCase,
  DeleteBlogUseCase,
  GetBlogByIdUseCase,
  GetBlogsUseCase,
  GetPostsToBlogUseCase,
  UpdateBlogUseCase,
];

@Module({
  imports: [
    CqrsModule,
    UsersModule,
    CommentsModule,
    DevicesModule,
    TypeOrmModule.forFeature([Blog, PostLike]),
  ],
  providers: [...services, ...repositories, ...useCases],
  controllers: [BlogsController, SaBlogsController],
  exports: [TypeOrmModule],
})
export class BlogsModule {}
