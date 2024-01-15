import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { PostsDefaultQuery } from '../default-query';
import { Post, postDocument } from '../posts-schema';
import { Comment, commentDocument } from '../../comments/comments-schema';
import { DataSource } from 'typeorm';
import { PostCreator } from '../application/posts-input';
import { UpdatePostInputModel } from '../api/posts-models';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name) private PostsModel: Model<postDocument>,
    @InjectModel(Comment.name) private CommentsModel: Model<commentDocument>,
    private dataSource: DataSource,
  ) {}

  async createNewPost(newPost: PostCreator) {
    return await this.dataSource.query(
      `
    INSERT INTO public."Posts"("title", "shortDescription", "blogId", "blogName", "createdAt", "content")

    VALUES ($1, $2, $3, $4, $5, $6)
    returning "id", "blogName", "createdAt";`,
      [
        newPost.title,
        newPost.shortDescription,
        newPost.blogId,
        newPost.blogName,
        newPost.createdAt,
        newPost.content,
      ],
    );
  }

  async createNewPostComment(newPostComment: any) {
    return await this.CommentsModel.create(newPostComment);
  }

  async getAllPosts(query: PostsDefaultQuery) {
    return await this.dataSource.query(
      `
    SELECT *
    FROM public."Posts"
    
    ORDER by "${query.sortBy}" ${query.sortDirection}
    LIMIT ${query.pageSize} offset (${query.pageNumber} - 1) * ${query.pageSize}
    `,
    );
  }

  async getPostById(postId: string) {
    const result = await this.dataSource.query(
      `
    SELECT *
    FROM public."Posts"
    WHERE "id" = $1
    `,
      [postId],
    );
    return result[0];
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

  async updatePostById(
    postId: string,
    blogId: string,
    dto: UpdatePostInputModel,
  ) {
    const result = await this.dataSource.query(
      `
    UPDATE public."Posts"
    SET "title" = $3, "content" = $4, "shortDescription" = $5
    WHERE "id" = $1 and "blogId" = $2`,
      [postId, blogId, dto.title, dto.content, dto.shortDescription],
    );
    return result[1] === 1;
  }

  async deletePostById(postId: string, blogId: string) {
    const result = await this.dataSource.query(
      `
    DELETE FROM public."Posts"
    WHERE "id" = $1 and "blogId" = $2`,
      [postId, blogId],
    );
    return result[1] === 1;
  }

  async countPosts() {
    const result = await this.dataSource.query(
      `
    SELECT count(*)
    FROM public."Posts"
    `,
    );
    return result[0].count;
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
