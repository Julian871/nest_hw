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
import { BlogsRepository } from './infrastructure/blogs-repository';
import { PostsModule } from '../posts/posts.module';
import { PostsRepository } from '../posts/infrastructure/posts-repository';
import { LikesPostService } from '../likes/likes-post-service';
import { AuthService } from '../../security/auth-service';
import { UsersService } from '../users/application/users-service';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from '../users/infrastructure/users-repository';
import { EmailManager } from '../../email/email-manager';
import { SessionRepository } from '../devices/infrastructure/session-repository';
import { CommentsModule } from '../comments/comments.module';
import { SaBlogsController } from './api/sa.blogs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogEntity } from './blog-entity';

const services = [
  BlogsService,
  LikesPostService,
  AuthService,
  UsersService,
  JwtService,
];
const repositories = [
  BlogsRepository,
  PostsRepository,
  UsersRepository,
  SessionRepository,
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
    PostsModule,
    UsersModule,
    CommentsModule,
    TypeOrmModule.forFeature([BlogEntity]),
  ],
  providers: [...services, ...repositories, ...useCases, EmailManager],
  controllers: [BlogsController, SaBlogsController],
  exports: [TypeOrmModule],
})
export class BlogsModule {}
