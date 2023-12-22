import { Injectable } from '@nestjs/common';
import { BlogsQuery } from '../blogs-query';
import { BlogsRepository } from '../infrastructure/blogs-repository';
import { BlogInformation } from './blogs-output';
import { PageInformation } from '../../page-information';
import { BlogCreator } from './blogs-input';
import { PostCreator } from '../../posts/application/posts-input';
import { PostInformation } from '../../posts/application/posts-output';
import { PostsRepository } from '../../posts/infrastructure/posts-repository';
import { BlogsDefaultQuery } from '../default-query';

@Injectable()
export class BlogsService {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly postsRepository: PostsRepository,
  ) {}
  async createNewBlog(data: any) {
    const newBlog = new BlogCreator(
      data.name,
      data.description,
      data.websiteUrl,
    );
    const blog = await this.blogsRepository.createNewBlog(newBlog);
    return new BlogInformation(
      blog._id.toString(),
      newBlog.name,
      newBlog.description,
      newBlog.websiteUrl,
      newBlog.createdAt,
      newBlog.isMembership,
    );
  }

  async getAllBlogs(query: BlogsQuery) {
    const blogsCount = await this.blogsRepository.countBlogsByName(query);
    const allBlogs = await this.blogsRepository.getAllBlogs(query);
    const filterBlogs = allBlogs.map(
      (p) =>
        new BlogInformation(
          p._id.toString(),
          p.name,
          p.description,
          p.websiteUrl,
          p.createdAt,
          p.isMembership,
        ),
    );
    return new PageInformation(
      query.pageNumber,
      query.pageSize,
      blogsCount,
      filterBlogs,
    );
  }

  async createNewPostByBlogId(blogId: string, data: any) {
    const blog = await this.blogsRepository.getBlogById(blogId);
    if (!blog) return false;

    const newPost = new PostCreator(
      data.title,
      data.shortDescription,
      data.content,
      blogId,
    );
    const post = await this.postsRepository.createNewPost(newPost);
    return new PostInformation(
      post._id.toString(),
      newPost.title,
      newPost.shortDescription,
      newPost.content,
      newPost.blogId,
      post.blogName,
      post.createdAt,
      0,
      0,
      'None',
      [],
    );
  }

  async getBlogById(blogId: string) {
    const blog = await this.blogsRepository.getBlogById(blogId);
    if (!blog) return false;
    return new BlogInformation(
      blog._id.toString(),
      blog.name,
      blog.description,
      blog.websiteUrl,
      blog.createdAt,
      blog.isMembership,
    );
  }

  async getPostByBlogId(query: BlogsDefaultQuery, blogId: string) {
    const blog = await this.blogsRepository.getBlogById(blogId);
    if (!blog) return false;
    const allPosts = await this.blogsRepository.getPostByBlogId(query, blogId);
    const countPost = await this.blogsRepository.countBlogsByBlogId(blogId);
    const filterPostsByBlogId = await Promise.all(
      allPosts.map(
        async (p) =>
          new PostInformation(
            p._id.toString(),
            p.title,
            p.shortDescription,
            p.content,
            blogId,
            p.blogName,
            p.createdAt,
            p.extendedLikesInfo.countLike,
            p.extendedLikesInfo.countDislike,
            'None',
            [],
          ),
      ),
    );
    return new PageInformation(
      query.pageNumber,
      query.pageSize,
      countPost,
      filterPostsByBlogId,
    );
  }

  async updateBlogById(id: string, dto: any) {
    return await this.blogsRepository.updateBlogById(id, dto);
  }

  async deleteBlogById(id: string) {
    return await this.blogsRepository.deleteBlogById(id);
  }
}
