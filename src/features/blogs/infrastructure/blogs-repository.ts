import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BlogsQuery } from '../blogs-query';
import { Blog, blogDocument } from '../blogs-schema';
import { Post, postDocument } from '../../posts/posts-schema';
import { BlogsDefaultQuery } from '../default-query';
import { UpdateBlogInputModel } from '../api/blogs-models';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectModel(Blog.name) private BlogsModel: Model<blogDocument>,
    @InjectModel(Post.name) private PostsModel: Model<postDocument>,
  ) {}
  async createNewBlog(newBlog: Blog) {
    return await this.BlogsModel.create(newBlog);
  }

  async getAllBlogs(query: BlogsQuery) {
    return this.BlogsModel.find({
      name: {
        $regex: query.searchNameTerm ? query.searchNameTerm : '',
        $options: 'i',
      },
    })
      .sort({ [query.sortBy ?? 'createdAt']: query.sortDirection ?? -1 })
      .skip((query.pageNumber - 1 ?? 1) * query.pageSize ?? 10)
      .limit(query.pageSize ?? 10)
      .lean();
  }

  async getBlogById(blogId: string) {
    return this.BlogsModel.findOne({ _id: blogId });
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
    const result = await this.BlogsModel.updateOne(
      { _id: id },
      {
        $set: {
          name: dto.name,
          description: dto.description,
          websiteUrl: dto.websiteUrl,
        },
      },
    );
    return result.matchedCount === 1;
  }

  async deleteAllCollection() {
    await this.BlogsModel.deleteMany();
  }

  async deleteBlogById(id: string) {
    const result = await this.BlogsModel.deleteOne({ _id: id });
    return result.deletedCount === 1;
  }

  async countBlogsByName(query: BlogsQuery) {
    return this.BlogsModel.countDocuments({
      name: {
        $regex: query.searchNameTerm ? query.searchNameTerm : '',
        $options: 'i',
      },
    });
  }

  async countBlogsByBlogId(blogId: string) {
    return this.PostsModel.countDocuments({
      blogId: { $regex: blogId ? blogId : '', $options: 'i' },
    });
  }
}
