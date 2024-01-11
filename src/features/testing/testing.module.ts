import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { Blog, BlogSchema } from '../blogs/blogs-schema';
import { Post, PostSchema } from '../posts/posts-schema';
import { Comment, CommentSchema } from '../comments/comments-schema';
import { User, UserSchema } from '../users/users-schema';
import { Session, SessionSchema } from '../devices/session-schema';
import { TestingController } from './testing-controller';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: User.name, schema: UserSchema },
      { name: Session.name, schema: SessionSchema },
    ]),
    TypeOrmModule.forFeature(),
  ],
  controllers: [TestingController],
})
export class TestingModule {}
