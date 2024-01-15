import {
  Body,
  Controller,
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
import { BasicAuthGuard, BearerAuthGuard } from '../../../security/auth-guard';
import { LikeStatusInputModel } from '../../likes/likes-models';
import { PostsRepository } from '../infrastructure/posts-repository';
import { CreateCommentInputModel } from '../../comments/api/comments-model';
import { CreatePostInputModel } from './posts-models';
import { ObjectIdPipe } from '../../../pipes/objectID.pipe';
import { CommandBus } from '@nestjs/cqrs';
import { CreatePostCommand } from '../application/use-cases/create-post-use-case';
import { GetAllPostsCommand } from '../application/use-cases/get-all-posts-use-case';
import { GetPostByIdCommand } from '../application/use-cases/get-post-by-id-use-case';
import { CreatePostCommentCommand } from '../application/use-cases/create-post-comment-use-case';
import { GetAllPostCommentCommand } from '../application/use-cases/get-all-post-comments-use-case';
import { UpdatePostLikeStatusCommand } from '../../likes/use-cases/update-post-like-status-use-case';
import { AuthService } from '../../../security/auth-service';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly authService: AuthService,
    private readonly postsRepository: PostsRepository,
    private commandBus: CommandBus,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Post()
  @HttpCode(201)
  async createPost(@Body() dto: CreatePostInputModel) {
    return this.commandBus.execute(new CreatePostCommand(dto));
  }

  @UseGuards(BearerAuthGuard)
  @Post('/:id/comments')
  async createCommentToPost(
    @Body() dto: CreateCommentInputModel,
    @Param('id', ObjectIdPipe) postId: string,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Re,
  ) {
    const comment = await this.commandBus.execute(
      new CreatePostCommentCommand(
        postId,
        dto.content,
        req.headers.authorization!,
      ),
    );
    if (!comment) {
      res.sendStatus(404);
      return;
    }
    return comment;
  }

  @Get()
  async getPosts(@Query() query: PostsDefaultQuery, @Req() req: Re) {
    let userId: string | null;
    if (!req.cookies.refreshToken) {
      userId = null;
    } else {
      userId = await this.authService.getUserIdFromRefreshToken(
        req.cookies.refreshToken,
      );
    }
    return await this.commandBus.execute(new GetAllPostsCommand(query, userId));
  }

  @Get('/:id')
  async getPost(
    @Param('id') postId: string,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Re,
  ) {
    let userId: string | null;
    if (!req.cookies.refreshToken) {
      userId = null;
    } else {
      userId = await this.authService.getUserIdFromRefreshToken(
        req.cookies.refreshToken,
      );
    }
    const post = await this.commandBus.execute(
      new GetPostByIdCommand(postId, userId),
    );
    if (!post) {
      res.status(HttpStatus.NOT_FOUND);
    } else res.status(HttpStatus.OK).send(post);
  }

  @Get('/:id/comments')
  async getPostComments(
    @Param('id', ObjectIdPipe) postId: string,
    @Res({ passthrough: true }) res: Response,
    @Query() query: PostsDefaultQuery,
  ) {
    const comments = await this.commandBus.execute(
      new GetAllPostCommentCommand(query, postId),
    );
    if (!comments) {
      res.status(HttpStatus.NOT_FOUND);
    } else res.status(HttpStatus.OK).send(comments);
  }

  @UseGuards(BearerAuthGuard)
  @Put('/:id/like-status')
  @HttpCode(204)
  async likesOperation(
    @Param('id', ObjectIdPipe) postId: string,
    @Body() dto: LikeStatusInputModel,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Re,
  ) {
    const checkPost = await this.postsRepository.getPostById(postId);
    if (!checkPost) {
      res.status(404);
      return;
    }
    let userId: string | null;
    if (!req.headers.authorization) {
      userId = null;
    } else {
      userId = await this.authService.getUserIdFromAccessToken(
        req.headers.authorization,
      );
    }
    await this.commandBus.execute(
      new UpdatePostLikeStatusCommand(postId, dto.likeStatus, userId),
    );
    return true;
  }
}
