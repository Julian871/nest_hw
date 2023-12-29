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
import { AuthService } from './features/auth/application/auth-service';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailManager } from './email/email-manager';
import { LikesPostService } from './features/likes/likes-post-service';
import { JwtModule } from '@nestjs/jwt';
import { LikesCommentsService } from './features/likes/likes-comment-service';
import { DevicesController } from './features/devices/api/devices.controllers';
import { join } from 'path';
import { BlackList, BlackListSchema } from './features/auth/blackList-schema';
import { IsBlogExistConstraint } from './features/posts/application/blogId.exist';
import { GetUsersUseCase } from './features/users/application/use-cases/get-users-use-case';
import { DeleteUserUseCase } from './features/users/application/use-cases/delete-user-use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateUserUseCase } from './features/users/application/use-cases/create-user-use-case';
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
  ],
})
export class AppModule {}
