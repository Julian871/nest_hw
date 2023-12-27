import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { BlogsQuery } from '../blogs-query';
import { BlogsService } from '../application/blogs-service';
import { Response } from 'express';
import { BlogsDefaultQuery } from '../default-query';
import { BasicAuthGuard } from '../../../security/auth-guard';
import { CreateBlogInputModel } from '../blogs-models';
import { CreatePostForBlogInputModel } from '../../posts/posts-models';

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}
  @UseGuards(BasicAuthGuard)
  @Post()
  @HttpCode(201)
  async createBlog(@Body() dto: CreateBlogInputModel) {
    return await this.blogsService.createNewBlog(dto);
  }

  @UseGuards(BasicAuthGuard)
  @Post(':id/posts')
  async createPostByBlog(
    @Body() dto: CreatePostForBlogInputModel,
    @Res({ passthrough: true }) res: Response,
    @Param('id') blogId: string,
  ) {
    const post = await this.blogsService.createNewPostByBlogId(blogId, dto);
    if (!post) {
      res.status(HttpStatus.NOT_FOUND);
    } else res.status(HttpStatus.CREATED).send(post);
  }

  @Get()
  async getBlogs(@Query() query: BlogsQuery) {
    return await this.blogsService.getAllBlogs(query);
  }

  @Get('/:id')
  async getBlog(
    @Param('id') blogId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const blog = await this.blogsService.getBlogById(blogId);
    if (!blog) {
      res.status(HttpStatus.NOT_FOUND);
    } else res.status(HttpStatus.OK).send(blog);
  }

  @Get('/:id/posts')
  async getPostsToBlog(
    @Param('id') blogId: string,
    @Query() query: BlogsDefaultQuery,
    @Res({ passthrough: true }) res: Response,
  ) {
    const postsList = await this.blogsService.getPostByBlogId(query, blogId);
    if (!postsList) {
      res.status(HttpStatus.NOT_FOUND);
    } else res.status(HttpStatus.OK).send(postsList);
  }

  @UseGuards(BasicAuthGuard)
  @Put('/:id')
  async updateBlog(
    @Param('id') blogId: string,
    @Body() dto: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const isUpdate = await this.blogsService.updateBlogById(blogId, dto);
    if (!isUpdate) {
      res.status(HttpStatus.NOT_FOUND);
    } else res.status(HttpStatus.NO_CONTENT);
  }

  @UseGuards(BasicAuthGuard)
  @Delete('/:id')
  async deleteBlog(
    @Param('id') blogId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const isDelete = await this.blogsService.deleteBlogById(blogId);
    if (!isDelete) {
      res.status(HttpStatus.NOT_FOUND);
    } else res.status(HttpStatus.NO_CONTENT);
  }
}
