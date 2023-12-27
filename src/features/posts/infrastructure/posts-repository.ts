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

  async getLikeStatus(postId: string, userId: string) {
    return this.PostsModel.findOne({
      _id: postId,
      'extendedLikesInfo.likeList.userId': userId,
    });
  }

  async getDislikeStatus(postId: string, userId: string) {
    return this.PostsModel.findOne({
      _id: postId,
      'extendedLikesInfo.dislikeList': userId,
    });
  }

  async updateLikeStatus(postId: string, newLike: any) {
    await this.PostsModel.updateOne(
      { _id: postId },
      {
        $inc: { 'extendedLikesInfo.countLike': 1 },
        $push: { 'extendedLikesInfo.likeList': newLike },
      },
    );
  }

  async updateDislikeStatus(postId: string, userId: string) {
    await this.PostsModel.updateOne(
      { _id: postId },
      {
        $inc: { 'extendedLikesInfo.countDislike': 1 },
        $push: { 'extendedLikesInfo.dislikeList': userId },
      },
    );
  }

  async updateLikeToNoneStatus(postId: string, userId: string) {
    await this.PostsModel.updateOne(
      { _id: postId },
      {
        $pull: { 'extendedLikesInfo.likeList': { userId: userId } },
        $inc: { 'extendedLikesInfo.countLike': -1 },
      },
    );
  }

  async updateDislikeToNoneStatus(postId: string, userId: string) {
    await this.PostsModel.updateOne(
      { _id: postId },
      {
        $pull: { 'extendedLikesInfo.dislikeList': userId },
        $inc: { 'extendedLikesInfo.countDislike': -1 },
      },
    );
  }

  async updateLikeToDislike(postId: string, userId: string) {
    await this.PostsModel.updateOne(
      { _id: postId },
      {
        $pull: { 'extendedLikesInfo.likeList': { userId: userId } },
        $inc: {
          'extendedLikesInfo.countLike': -1,
          'extendedLikesInfo.countDislike': 1,
        },
        $push: { 'extendedLikesInfo.dislikeList': userId },
      },
    );
  }

  async updateDislikeToLike(postId: string, newLike: any, userId: string) {
    await this.PostsModel.updateOne(
      { _id: postId },
      {
        $pull: { 'extendedLikesInfo.dislikeList': userId },
        $inc: {
          'extendedLikesInfo.countDislike': -1,
          'extendedLikesInfo.countLike': 1,
        },
        $push: { 'extendedLikesInfo.likeList': newLike },
      },
    );
  }

  async getLikeListToPost(postId: string) {
    return this.PostsModel.findOne(
      { _id: postId },
      { 'extendedLikesInfo.likeList': { $slice: -3 } },
    );
  }
}
