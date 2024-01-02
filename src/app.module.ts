import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TestingController } from './features/testing-controller';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

import { AppController } from './features/app/app.controller';
import { AppService } from './features/app/app.service';

import { User, UserSchema } from './features/users/users-schema';
import { UsersController } from './features/users/api/users.controller';
import { UsersRepository } from './features/users/infrastructure/users-repository';
import { UsersService } from './features/users/application/users-service';

import { Blog, BlogSchema } from './features/blogs/blogs-schema';
import { BlogsController } from './features/blogs/api/blogs.controller';
import { BlogsService } from './features/blogs/application/blogs-service';
import { BlogsRepository } from './features/blogs/infrastructure/blogs-repository';

import { Post, PostSchema } from './features/posts/posts-schema';
import { PostsController } from './features/posts/api/posts.controllers';
import { PostsRepository } from './features/posts/infrastructure/posts-repository';
import { PostsService } from './features/posts/application/posts-service';

import { Comment, CommentSchema } from './features/comments/comments-schema';
import { CommentsController } from './features/comments/api/comments.controllers';
import { CommentsService } from './features/comments/application/comments-service';
import { CommentsRepository } from './features/comments/infrastructure/comments-repository';

import { Connect, ConnectSchema } from './features/connect/connect-schema';
import { ConnectService } from './features/connect/connect-service';
import { ConnectRepository } from './features/connect/connect-repository';

import dotenv from 'dotenv';
import { AuthController } from './features/auth/api/auth.controller';
import { AuthService } from './security/auth-service';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailManager } from './email/email-manager';
import { LikesPostService } from './features/likes/likes-post-service';
import { JwtModule } from '@nestjs/jwt';
import { LikesCommentsService } from './features/likes/likes-comment-service';
import { DevicesController } from './features/devices/api/devices.controllers';
import { join } from 'path';
import { BlackList, BlackListSchema } from './security/blackList-schema';
import { IsBlogExistConstraint } from './features/posts/application/blogId.exist';
import { GetUsersUseCase } from './features/users/application/use-cases/get-users-use-case';
import { DeleteUserUseCase } from './features/users/application/use-cases/delete-user-use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateUserUseCase } from './features/users/application/use-cases/create-user-use-case';
import { CreateBlogUseCase } from './features/blogs/application/use-cases/create-blog-use-case';
import { CreatePostToBlogUseCase } from './features/blogs/application/use-cases/create-post-to-blog-use-case';
import { GetBlogsUseCase } from './features/blogs/application/use-cases/get-blogs-use-case';
import { GetBlogByIdUseCase } from './features/blogs/application/use-cases/get-blog-by-id-use-case';
import { GetPostsToBlogUseCase } from './features/blogs/application/use-cases/get-posts-to-blog-use-case';
import { UpdateBlogUseCase } from './features/blogs/application/use-cases/update-blog-use-case';
import { DeleteBlogUseCase } from './features/blogs/application/use-cases/delete-blog-use-case';
import { CreatePostUseCase } from './features/posts/application/use-cases/create-post-use-case';
import { GetAllPostsUseCase } from './features/posts/application/use-cases/get-all-posts-use-case';
import { GetPostByIdUseCase } from './features/posts/application/use-cases/get-post-by-id-use-case';
import { UpdatePostUseCase } from './features/posts/application/use-cases/update-post-use-case';
import { DeletePostUseCase } from './features/posts/application/use-cases/delete-post-use-case';
import { CreatePostCommentUseCase } from './features/posts/application/use-cases/create-post-comment-use-case';
import { GetAllPostCommentUseCase } from './features/posts/application/use-cases/get-all-post-comments-use-case';
import { GetCommentUseCase } from './features/comments/application/use-cases/get-comment-use-case';
import { UpdateCommentUseCase } from './features/comments/application/use-cases/update-comment-use-case';
import { UpdatePostLikeStatusUseCase } from './features/likes/use-cases/update-post-like-status-use-case';
import { UpdateCommentLikeStatusUseCase } from './features/likes/use-cases/update-comment-like-status-use-case';
dotenv.config();

@Module({
  imports: [
    ConfigModule,
    CqrsModule,
    MongooseModule.forRoot(process.env.MONGO_URL || 'local connectio', {
      dbName: 'hw3',
    }),
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          port: 465,
          host: 'smtp.gmail.com',
          auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
          },
        },
        defaults: {
          from: 'Julian <process.env.EMAIL>',
        },
        template: {
          dir: join(__dirname + '/templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
    JwtModule.register({}),
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Blog.name,
        schema: BlogSchema,
      },
      {
        name: Post.name,
        schema: PostSchema,
      },
      {
        name: Comment.name,
        schema: CommentSchema,
      },
      {
        name: Connect.name,
        schema: ConnectSchema,
      },
      {
        name: BlackList.name,
        schema: BlackListSchema,
      },
    ]),
  ],
  controllers: [
    AppController,
    UsersController,
    TestingController,
    BlogsController,
    PostsController,
    CommentsController,
    AuthController,
    DevicesController,
  ],
  providers: [
    AppService,
    UsersRepository,
    UsersService,
    BlogsService,
    BlogsRepository,
    PostsRepository,
    PostsService,
    CommentsService,
    CommentsRepository,
    ConnectService,
    ConnectRepository,
    AuthService,
    EmailManager,
    LikesPostService,
    LikesCommentsService,
    IsBlogExistConstraint,
    GetUsersUseCase,
    DeleteUserUseCase,
    CreateUserUseCase,
    CreateBlogUseCase,
    CreatePostToBlogUseCase,
    GetBlogsUseCase,
    GetBlogByIdUseCase,
    GetPostsToBlogUseCase,
    UpdateBlogUseCase,
    DeleteBlogUseCase,
    CreatePostUseCase,
    GetAllPostsUseCase,
    GetPostByIdUseCase,
    UpdatePostUseCase,
    DeletePostUseCase,
    CreatePostCommentUseCase,
    GetAllPostCommentUseCase,
    GetCommentUseCase,
    UpdateCommentUseCase,
    UpdatePostLikeStatusUseCase,
    UpdateCommentLikeStatusUseCase,
  ],
})
export class AppModule {}
