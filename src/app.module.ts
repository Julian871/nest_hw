import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { AppController } from './features/app/app.controller';
import { AppService } from './features/app/app.service';
import dotenv from 'dotenv';
import { MailerModule } from '@nestjs-modules/mailer';
import { JwtModule } from '@nestjs/jwt';
import { join } from 'path';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './features/users/users.module';
import { PostsModule } from './features/posts/posts.module';
import { BlogsModule } from './features/blogs/blogs.module';
import { AuthModule } from './features/auth/auth.module';
import { CommentsModule } from './features/comments/comments.module';
import { DevicesModule } from './features/devices/devices.module';
import { TestingModule } from './features/testing/testing.module';
import { User } from './entities/user-entity';
import { Session } from './entities/session-entity';
import { Blog } from './entities/blog-entity';
import { Post } from './entities/post-entity';
import { PostLike } from './entities/post-like-entity';
import { Comment } from './entities/comment-entity';
import { CommentLike } from './entities/comment-like-entity';
dotenv.config();

@Module({
  imports: [
    ConfigModule,
    CqrsModule,
    TypeOrmModule.forRoot({
      entities: [User, Session, Blog, Post, PostLike, Comment, CommentLike],
      synchronize: true,
      type: 'postgres',
      url: process.env.SQL_URL,
      autoLoadEntities: true,
      ssl: true,
    }),
    TypeOrmModule.forFeature([]),
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
    UsersModule,
    PostsModule,
    BlogsModule,
    AuthModule,
    CommentsModule,
    DevicesModule,
    TestingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
