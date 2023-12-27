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
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request as Re, Response } from 'express';
import { PostsDefaultQuery } from '../default-query';
import { PostsService } from '../application/posts-service';
import { BasicAuthGuard, BearerAuthGuard } from '../../../security/auth-guard';
import { LikeStatusInputModel } from '../../likes/likes-models';
import { LikesPostService } from '../../likes/likes-post-service';
import { AuthService } from '../../auth/application/auth-service';
import { PostsRepository } from '../infrastructure/posts-repository';
import { CreateCommentInputModel } from '../../comments/comments-model';
import { CreatePostInputModel } from '../posts-models';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly likesService: LikesPostService,
    private readonly authService: AuthService,
    private readonly postsRepository: PostsRepository,
  ) {}
  @UseGuards(BasicAuthGuard)
  @Post()
  @HttpCode(201)
  async createPost(@Body() dto: CreatePostInputModel) {
    return this.postsService.createNewPost(dto);
  }

  @UseGuards(BearerAuthGuard)
  @Post('/:id/comments')
  async createCommentToPost(
    @Body() dto: CreateCommentInputModel,
    @Param('id') postId: string,
    @Req() req: Re,
  ) {
    const userId = await this.authService.getUserIdFromAccessToken(
      req.headers.authorization!,
    );
    return await this.postsService.createNewPostComment(
      postId,
      dto.content,
      userId,
    );
  }

  @Get()
  async getPosts(@Query() query: PostsDefaultQuery, @Req() req: Re) {
    const userId =
      (await this.authService.getUserIdFromRefreshToken(
        req.cookies.refreshToken,
      )) ??
      (await this.authService.getUserIdFromAccessToken(
        req.headers.authorization!,
      ));
    return await this.postsService.getAllPosts(query, userId);
  }

  @Get('/:id')
  async getPost(
    @Param('id') postId: string,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Re,
  ) {
    const userId =
      (await this.authService.getUserIdFromRefreshToken(
        req.cookies.refreshToken,
      )) ??
      (await this.authService.getUserIdFromAccessToken(
        req.headers.authorization!,
      ));
    const post = await this.postsService.getPostById(postId, userId);
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

  @UseGuards(BasicAuthGuard)
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

  @UseGuards(BearerAuthGuard)
  @Put('/:id/like-status')
  @HttpCode(204)
  async likesOperation(
    @Param('id') postId: string,
    @Body() likeStatus: LikeStatusInputModel,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Re,
  ) {
    const userId = await this.authService.getUserIdFromAccessToken(
      req.headers.authorization!,
    );
    const checkPost = await this.postsRepository.getPostById(postId);
    if (!checkPost) {
      res.status(404);
      return;
    }
    await this.likesService.updateLikeStatus(
      postId,
      likeStatus.likeStatus,
      userId,
    );
    return true;
  }

  @UseGuards(BasicAuthGuard)
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
