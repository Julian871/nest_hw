import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BlogsQuery } from '../blogs-query';
import { Blog } from '../blogs-schema';
import { Post, postDocument } from '../../posts/posts-schema';
import { BlogsDefaultQuery } from '../default-query';
import { UpdateBlogInputModel } from '../api/blogs-dto-models';
import { DataSource } from 'typeorm';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectModel(Post.name) private PostsModel: Model<postDocument>,
    private dataSource: DataSource,
  ) {}
  async createNewBlog(newBlog: Blog) {
    return await this.dataSource.query(
      `
    INSERT INTO public."Blogs"("name", "description", "websiteUrl", "createdAt")

    VALUES ($1, $2, $3, $4)
    returning id;`,
      [newBlog.name, newBlog.createdAt, newBlog.websiteUrl, newBlog.createdAt],
    );
  }

  async getAllBlogs(query: BlogsQuery) {
    return await this.dataSource.query(
      `
    SELECT *
    FROM public."Blogs"
    WHERE "name" like $1
    
    ORDER by "${query.sortBy}" ${query.sortDirection}
    LIMIT ${query.pageSize} offset (${query.pageNumber} - 1) * ${query.pageSize}
    `,
      [`%${query.searchNameTerm}%`],
    );
  }

  async getBlogById(blogId: string) {
    const blog = await this.dataSource.query(
      `
    SELECT *
    FROM public."Blogs"
    WHERE "id" = $1`,
      [blogId],
    );
    return blog[0];
  }

  async getPostByBlogId(query: BlogsDefaultQuery, blogId: string) {
    return this.PostsModel.find({
      blogId: { $regex: blogId ? blogId : '', $options: 'i' },
    })
      .sort({ [query.sortBy ?? 'createdAt']: query.sortDirection ?? -1 })
      .skip((query.pageNumber - 1 ?? 1) * query.pageSize ?? 10)
      .limit(query.pageSize ?? 10)
      .lean();
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
    WHERE "name" like $1
    `,
      [`%${query.searchNameTerm}%`],
    );
    return result[0].count;
  }

  async countBlogsByBlogId(blogId: string) {
    return this.PostsModel.countDocuments({
      blogId: { $regex: blogId ? blogId : '', $options: 'i' },
    });
  }
}
