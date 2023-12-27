import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, commentDocument } from '../comments-schema';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private CommentsModel: Model<commentDocument>,
  ) {}
  async getCommentById(commentId: string) {
    return this.CommentsModel.findOne({ _id: commentId });
  }

  async deleteCommentById(commentId: string) {
    await this.CommentsModel.deleteOne({ _id: commentId });
  }

  async deleteAllCollection() {
    await this.CommentsModel.deleteMany();
  }

  async updateCommentById(commentId: string, content: string) {
    await this.CommentsModel.updateOne(
      { _id: commentId },
      {
        $set: {
          content: content,
        },
      },
    );
  }

  async getLikeStatus(commentId: string, userId: string) {
    return this.CommentsModel.findOne({
      _id: commentId,
      'likesInfo.likeList': userId,
    });
  }

  async getDislikeStatus(commentId: string, userId: string) {
    return this.CommentsModel.findOne({
      _id: commentId,
      'likesInfo.dislikeList': userId,
    });
  }

  async updateLikeStatus(commentId: string, userId: string) {
    await this.CommentsModel.updateOne(
      { _id: commentId },
      {
        $inc: { 'likesInfo.countLike': 1 },
        $push: { 'likesInfo.likeList': userId },
      },
    );
  }

  async updateDislikeStatus(commentId: string, userId: string) {
    await this.CommentsModel.updateOne(
      { _id: commentId },
      {
        $inc: { 'likesInfo.countDislike': 1 },
        $push: { 'likesInfo.dislikeList': userId },
      },
    );
  }

  async updateLikeToNoneStatus(commentId: string, userId: string) {
    await this.CommentsModel.updateOne(
      { _id: commentId },
      {
        $pull: { 'likesInfo.likeList': userId },
        $inc: { 'likesInfo.countLike': -1 },
      },
    );
  }

  async updateDislikeToNoneStatus(commentId: string, userId: string) {
    await this.CommentsModel.updateOne(
      { _id: commentId },
      {
        $pull: { 'likesInfo.dislikeList': userId },
        $inc: { 'likesInfo.countDislike': -1 },
      },
    );
  }

  async updateLikeToDislike(commentId: string, userId: string) {
    await this.CommentsModel.updateOne(
      { _id: commentId },
      {
        $pull: { 'likesInfo.likeList': userId },
        $inc: { 'likesInfo.countLike': -1, 'likesInfo.countDislike': 1 },
        $push: { 'likesInfo.dislikeList': userId },
      },
    );
  }

  async updateDislikeToLike(commentId: string, userId: string) {
    await this.CommentsModel.updateOne(
      { _id: commentId },
      {
        $pull: { 'likesInfo.dislikeList': userId },
        $inc: { 'likesInfo.countDislike': -1, 'likesInfo.countLike': 1 },
        $push: { 'likesInfo.likeList': userId },
      },
    );
  }
}
