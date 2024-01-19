import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogsQuery } from '../blogs-query';
import { BlogsDefaultQuery } from '../default-query';
import { UpdateBlogInputModel } from '../api/blogs-dto-models';
import { DataSource } from 'typeorm';

@Injectable()
export class BlogsRepository {
  constructor(private dataSource: DataSource) {}
  async createNewBlog(name: string, description: string, websiteUrl: string) {
    return await this.dataSource.query(
      `
    INSERT INTO public."Blogs"("name", "description", "websiteUrl", "createdAt")

    VALUES ($1, $2, $3, now())
    returning "id", "createdAt";`,
      [name, description, websiteUrl],
    );
  }

  async getAllBlogs(query: BlogsQuery) {
    return await this.dataSource.query(
      `
    SELECT *
    FROM public."Blogs"
    WHERE "name" ilike $1
    
    ORDER by "${query.sortBy}" ${query.sortDirection}
    LIMIT ${query.pageSize} offset (${query.pageNumber} - 1) * ${query.pageSize}
    `,
      [`%${query.searchNameTerm}%`],
    );
  }

  async getBlogById(blogId: number) {
    const blog = await this.dataSource.query(
      `
    SELECT *
    FROM public."Blogs"
    WHERE "id" = $1`,
      [blogId],
    );
    if (blog.length === 0) throw new NotFoundException();
    return blog[0].name;
  }

  async getPostByBlogId(query: BlogsDefaultQuery, blogId: number) {
    return await this.dataSource.query(
      `
    SELECT *
    FROM public."Posts"
    WHERE "blogId" ilike $1
    
    ORDER by "${query.sortBy}" ${query.sortDirection}
    LIMIT ${query.pageSize} offset (${query.pageNumber} - 1) * ${query.pageSize}
    `,
      [`%${blogId}%`],
    );
  }

  async updateBlogById(id: string, dto: UpdateBlogInputModel) {
    const result = await this.dataSource.query(
      `
    UPDATE public."Blogs"
    SET "name" = $1, "description" = $2, "websiteUrl" = $3
    WHERE "id" = $4`,
      [dto.name, dto.description, dto.websiteUrl, id],
    );
    return result[1] === 1;
  }

  async deleteBlogById(blogId: string) {
    const result = await this.dataSource.query(
      `
    DELETE FROM public."Blogs"
    WHERE "id" = $1`,
      [blogId],
    );
    return result[1] === 1;
  }

  async countBlogsByName(query: BlogsQuery) {
    const result = await this.dataSource.query(
      `
    SELECT count(*)
    FROM public."Blogs"
    WHERE "name" ilike $1
    `,
      [`%${query.searchNameTerm}%`],
    );
    return result[0].count;
  }

  async countPostsByBlogId(blogId: number) {
    const result = await this.dataSource.query(
      `
    SELECT count(*)
    FROM public."Posts"
    WHERE "blogId" ilike $1
    `,
      [`%${blogId}%`],
    );
    return result[0].count;
  }
}
