import { Controller, Delete, HttpCode } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, blogDocument } from '../blogs/blogs-schema';
import { Model } from 'mongoose';
import { Post, postDocument } from '../posts/posts-schema';
import { Comment, commentDocument } from '../comments/comments-schema';
import { User, userDocument } from '../users/users-schema';
import { Session, sessionDocument } from '../devices/session/session-schema';
import {
  Connection,
  connectionDocument,
} from '../connection/connection-schema';
import { DataSource } from 'typeorm';

@Controller('testing')
export class TestingController {
  constructor(
    @InjectModel(Blog.name) private BlogsModel: Model<blogDocument>,
    @InjectModel(Post.name) private PostsModel: Model<postDocument>,
    @InjectModel(Comment.name) private CommentsModel: Model<commentDocument>,
    @InjectModel(User.name) private UsersModel: Model<userDocument>,
    @InjectModel(Session.name) private SessionModel: Model<sessionDocument>,
    @InjectModel(Connection.name)
    private ConnectionModel: Model<connectionDocument>,
    private dataSource: DataSource,
  ) {}

  @Delete('all-data')
  @HttpCode(204)
  async deleteAll() {
    await this.BlogsModel.deleteMany();
    await this.PostsModel.deleteMany();
    await this.CommentsModel.deleteMany();
    await this.UsersModel.deleteMany();
    await this.SessionModel.deleteMany();
    await this.ConnectionModel.deleteMany();
    await this.dataSource.query(`DELETE FROM public."Users"`);
  }
}
