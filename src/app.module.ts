import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
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
import { UserEntity } from './features/users/user-entity';
import { SessionEntity } from './features/devices/session-entity';
import { BlogEntity } from './features/blogs/blog-entity';
dotenv.config();

@Module({
  imports: [
    ConfigModule,
    CqrsModule,
    TypeOrmModule.forRoot({
      entities: [UserEntity, SessionEntity, BlogEntity],
      synchronize: true,
      type: 'postgres',
      url: process.env.SQL_URL,
      ssl: true,
    }),
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
    MongooseModule.forFeature([]),
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
