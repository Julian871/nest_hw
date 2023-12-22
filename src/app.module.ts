import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TestingController } from './features/testing-controller';

import { AppController } from './app/app.controller';
import { AppService } from './app/app.service';

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
import { JwtService } from '@nestjs/jwt';
dotenv.config();

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forRoot(process.env.MONGO_URL || 'local connectio', {
      dbName: 'hw3',
    }),
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
    JwtService,
  ],
})
export class AppModule {}
