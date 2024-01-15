import { Controller, Delete, HttpCode } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, postDocument } from '../posts/posts-schema';
import { Comment, commentDocument } from '../comments/comments-schema';
import { DataSource } from 'typeorm';

@Controller('testing')
export class TestingController {
  constructor(
    @InjectModel(Post.name) private PostsModel: Model<postDocument>,
    @InjectModel(Comment.name) private CommentsModel: Model<commentDocument>,
    private dataSource: DataSource,
  ) {}

  @Delete('all-data')
  @HttpCode(204)
  async deleteAll() {
    await this.PostsModel.deleteMany();
    await this.CommentsModel.deleteMany();
    await this.dataSource.query(`DELETE FROM public."Users"`);
    await this.dataSource.query(`DELETE FROM public."Session"`);
    await this.dataSource.query(`DELETE FROM public."Blogs"`);
  }
}
