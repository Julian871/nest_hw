import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PostsDefaultQuery } from '../../posts/default-query';

@Injectable()
export class CommentsRepository {
  constructor(private dataSource: DataSource) {}
  async createNewPostComment(
    postId: number,
    content: string,
    userId: number,
    login: string,
  ) {
    return await this.dataSource.query(
      `
    INSERT INTO public."Comments"("postId", "content", "createdAt", "userId", "login")

    VALUES ($1, $2, now(), $3, $4)
    returning "id", "createdAt";`,
      [postId, content, userId, login],
    );
  }

  async countCommentToPost(postId: number) {
    const result = await this.dataSource.query(
      `
    SELECT count(*)
    FROM public."Comments"
    WHERE "postId" = $1
    `,
      [postId],
    );
    return result[0].count;
  }

  async getAllCommentsToPost(query: PostsDefaultQuery, postId: number) {
    return await this.dataSource.query(
      `
    SELECT *
    FROM public."Comments"
    WHERE "postId" = $1
    ORDER by "${query.sortBy}" ${query.sortDirection}
    LIMIT ${query.pageSize} offset (${query.pageNumber} - 1) * ${query.pageSize}
    `,
      [postId],
    );
  }

  async getCommentById(commentId: number) {
    const result = await this.dataSource.query(
      `
    SELECT *
    FROM public."Comments"
    WHERE "id" = $1
    `,
      [commentId],
    );
    return result[0];
  }

  async updateCommentById(commentId: number, content: string) {
    await this.dataSource.query(
      `
    UPDATE public."Comments"
    SET "content" = $2
    WHERE "id" = $1`,
      [commentId, content],
    );
  }

  async deleteCommentById(commentId: number) {
    await this.dataSource.query(
      `
    DELETE FROM public."Comments"
    WHERE "id" = $1`,
      [commentId],
    );
  }

  async getUserLikeInfoToComment(userId: number, commentId: number) {
    return await this.dataSource.query(
      `
    SELECT *
    FROM public."CommentLikes"
    WHERE "userId" = $1 and "commentId" = $2
    `,
      [userId, commentId],
    );
  }

  async takeLikeOrDislike(
    commentId: number,
    likeStatus: string,
    userId: number,
    login: string,
  ) {
    return await this.dataSource.query(
      `
    INSERT INTO public."CommentLikes"("commentId", "userId", "userLogin", "status", "addedAt")

    VALUES ($1, $2, $3, $4, now())`,
      [commentId, userId, login, likeStatus],
    );
  }

  async deleteLikeOrDislikeInfo(likeId: number) {
    await this.dataSource.query(
      `
    DELETE FROM public."CommentLikes"
    WHERE "id" = $1`,
      [likeId],
    );
  }

  async countCommentLike(commentId: number) {
    const result = await this.dataSource.query(
      `
    SELECT count(*)
    FROM public."CommentLikes"
    WHERE "commentId" = $1 and "status" = 'Like'
    `,
      [commentId],
    );
    return +result[0].count;
  }

  async countCommentDislike(commentId: number) {
    const result = await this.dataSource.query(
      `
    SELECT count(*)
    FROM public."CommentLikes"
    WHERE "commentId" = $1 and "status" = 'Dislike'
    `,
      [commentId],
    );
    return +result[0].count;
  }
}
