import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { PostsDefaultQuery } from '../default-query';
import { Post, postDocument } from '../posts-schema';
import { Comment, commentDocument } from '../../comments/comments-schema';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name) private PostsModel: Model<postDocument>,
    @InjectModel(Comment.name) private CommentsModel: Model<commentDocument>,
  ) {}

  async createNewPost(newPost: any) {
    return await this.PostsModel.create(newPost);
  }

  async createNewPostComment(newPostComment: any) {
    return await this.CommentsModel.create(newPostComment);
  }

  async getAllPosts(query: PostsDefaultQuery) {
    return this.PostsModel.find({})
      .sort({ [query.sortBy ?? 'createdAt']: query.sortDirection ?? -1 })
      .skip((query.pageNumber - 1 ?? 1) * query.pageSize ?? 10)
      .limit(query.pageSize ?? 10)
      .lean();
  }

  async getPostById(id: string) {
    return this.PostsModel.findOne({ _id: id });
  }

  async getAllPostsComments(query: PostsDefaultQuery, id: string) {
    return this.CommentsModel.find({
      idPost: { $regex: id ? id : '', $options: 'i' },
    })
      .sort({ [query.sortBy ?? 'createdAt']: query.sortDirection ?? -1 })
      .skip((query.pageNumber - 1 ?? 1) * query.pageSize ?? 10)
      .limit(query.pageSize ?? 10)
      .lean();
  }

  async updatePostById(id: string, data: any) {
    const result = await this.PostsModel.updateOne(
      { _id: id },
      {
        $set: {
          title: data.title,
          shortDescription: data.shortDescription,
          content: data.content,
          blogId: data.blogId,
        },
      },
    );
    return result.matchedCount === 1;
  }

  async deletePostById(id: string) {
    const result = await this.PostsModel.deleteOne({ _id: id });
    return result.deletedCount === 1;
  }

  async deleteAllCollection() {
    await this.PostsModel.deleteMany();
  }

  async countPosts() {
    return this.PostsModel.countDocuments();
  }

  async countPostsComments(id: string) {
    return this.CommentsModel.countDocuments({
      idPost: { $regex: id ? id : '', $options: 'i' },
    });
  }
}
