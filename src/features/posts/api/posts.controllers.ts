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
} from '@nestjs/common';
import { Response } from 'express';
import { PostsDefaultQuery } from '../default-query';
import { PostsService } from '../application/posts-service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}
  @Post()
  @HttpCode(201)
  async createBlog(@Body() dto: any) {
    return this.postsService.createNewPost(dto);
  }

  @Post('/:id/comments')
  async createCommentToPost(@Body() dto: any, @Param('id') postId: string) {
    await this.postsService.createNewPostComment(postId, dto);
  }

  @Get()
  async getPosts(@Query() query: PostsDefaultQuery) {
    return await this.postsService.getAllPosts(query);
  }

  @Get('/:id')
  async getPost(
    @Param('id') postId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const post = await this.postsService.getPostById(postId);
    if (!post) {
      res.status(HttpStatus.NOT_FOUND);
    } else res.status(HttpStatus.OK).send(post);
  }

  @Get('/:id/comments')
  async getPostComments(
    @Param('id') postId: string,
    @Res({ passthrough: true }) res: Response,
    @Query() query: PostsDefaultQuery,
  ) {
    const comments = await this.postsService.getAllPostsComments(query, postId);
    if (!comments) {
      res.status(HttpStatus.NOT_FOUND);
    } else res.status(HttpStatus.OK).send(comments);
  }

  @Put('/:id')
  async updatePost(
    @Param('id') postId: string,
    @Body() dto: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const isUpdate = await this.postsService.updatePostById(postId, dto);
    if (!isUpdate) {
      res.status(HttpStatus.NOT_FOUND);
    } else res.status(HttpStatus.NO_CONTENT);
  }

  @Delete('/:id')
  async deletePost(
    @Param('id') postId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const isDelete = await this.postsService.deletePostById(postId);
    if (!isDelete) {
      res.status(HttpStatus.NOT_FOUND);
    } else res.status(HttpStatus.NO_CONTENT);
  }
}
