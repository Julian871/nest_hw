import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { Blog, BlogSchema } from '../blogs/blogs-schema';
import { Post, PostSchema } from '../posts/posts-schema';
import { Comment, CommentSchema } from '../comments/comments-schema';
import { User, UserSchema } from '../users/users-schema';
import { Connection, ConnectionSchema } from '../connection/connection-schema';
import { Session, SessionSchema } from '../devices/session-schema';
import { TestingController } from './testing-controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: User.name, schema: UserSchema },
      { name: Connection.name, schema: ConnectionSchema },
      { name: Session.name, schema: SessionSchema },
    ]),
  ],
  controllers: [TestingController],
})
export class TestingModule {}
