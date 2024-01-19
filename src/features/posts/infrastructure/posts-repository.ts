import { Injectable } from '@nestjs/common';
import { PostsDefaultQuery } from '../default-query';
import { DataSource } from 'typeorm';
import { UpdatePostInputModel } from '../api/posts-models';

@Injectable()
export class PostsRepository {
  constructor(private dataSource: DataSource) {}

  async createNewPost(
    title: string,
    shortDescription: string,
    blogId: number,
    blogName: string,
    content: string,
  ) {
    return await this.dataSource.query(
      `
    INSERT INTO public."Posts"("title", "shortDescription", "blogId", "blogName", "createdAt", "content")

    VALUES ($1, $2, $3, $4, now(), $5)
    returning "id", "blogName", "createdAt";`,
      [title, shortDescription, blogId, blogName, content],
    );
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

  async getPostById(postId: number) {
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

  async getUserLikeInfoToPost(userId: number, postId: number) {
    return await this.dataSource.query(
      `
    SELECT *
    FROM public."PostLikes"
    WHERE "userId" = $1 and "postId" = $2
    `,
      [userId, postId],
    );
  }

  async takeLikeOrDislike(
    postId: number,
    likeStatus: string,
    userId: number,
    login: string,
  ) {
    return await this.dataSource.query(
      `
    INSERT INTO public."PostLikes"("postId", "userId", "userLogin", "status", "addedAt")

    VALUES ($1, $2, $3, $4, now())`,
      [postId, userId, login, likeStatus],
    );
  }

  async deleteLikeOrDislikeInfo(likeId: number) {
    await this.dataSource.query(
      `
    DELETE FROM public."PostLikes"
    WHERE "id" = $1`,
      [likeId],
    );
  }

  async countPostLike(postId: number) {
    const result = await this.dataSource.query(
      `
    SELECT count(*)
    FROM public."PostLikes"
    WHERE "postId" = $1 and "status" = 'Like'
    `,
      [postId],
    );
    return result[0].count;
  }

  async countPostDislike(postId: number) {
    const result = await this.dataSource.query(
      `
    SELECT count(*)
    FROM public."PostLikes"
    WHERE "postId" = $1 and "status" = 'Dislike'
    `,
      [postId],
    );
    return result[0].count;
  }

  async getListLike(postId: number) {
    const result = await this.dataSource.query(
      `
    SELECT *
    FROM public."PostLikes"
    WHERE "postId" = $1
    ORDER BY "createdAt" DESC
    LIMIT 3
    `,
      [postId],
    );
    return result[0];
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
}
