import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, commentDocument } from '../comments-schema';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private CommentsModel: Model<commentDocument>,
  ) {}
  async getCommentById(id: string) {
    return this.CommentsModel.findOne({ _id: id });
  }

  async deleteAllCollection() {
    await this.CommentsModel.deleteMany();
  }
}
