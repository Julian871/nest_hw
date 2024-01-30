import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
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
import { CreateCommentInputModel } from '../../comments/api/comments-model';
import { CreatePostInputModel } from './posts-models';
import { CommandBus } from '@nestjs/cqrs';
import { CreatePostCommand } from '../application/use-cases/create-post-use-case';
import { GetAllPostsCommand } from '../application/use-cases/get-all-posts-use-case';
import { GetPostByIdCommand } from '../application/use-cases/get-post-by-id-use-case';
import { CreatePostCommentCommand } from '../application/use-cases/create-post-comment-use-case';
import { GetAllPostCommentCommand } from '../application/use-cases/get-all-post-comments-use-case';
import { UpdatePostLikeStatusCommand } from '../../likes/application/use-cases/update-post-like-status-use-case';
import { AuthService } from '../../../security/auth-service';
import { PostsRepo } from '../infrastructure/post-repo';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly authService: AuthService,
    private readonly postsRepo: PostsRepo,
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
    @Param('id') postId: string,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Re,
  ) {
    return await this.commandBus.execute(
      new CreatePostCommentCommand(
        +postId,
        dto.content,
        req.headers.authorization!,
      ),
    );
  }

  @Get()
  async getPosts(@Query() query: PostsDefaultQuery, @Req() req: Re) {
    let userId: number | null;
    if (req.cookies.refreshToken) {
      userId = await this.authService.getUserIdFromRefreshToken(
        req.cookies.refreshToken,
      );
    } else if (req.headers.authorization) {
      userId = await this.authService.getUserIdFromAccessToken(
        req.headers.authorization!,
      );
    } else {
      userId = null;
    }

    return await this.commandBus.execute(new GetAllPostsCommand(query, userId));
  }

  @Get('/:id')
  async getPost(
    @Param('id') postId: string,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Re,
  ) {
    let userId: number | null;
    if (req.cookies.refreshToken) {
      userId = await this.authService.getUserIdFromRefreshToken(
        req.cookies.refreshToken,
      );
    } else if (req.headers.authorization) {
      userId = await this.authService.getUserIdFromAccessToken(
        req.headers.authorization!,
      );
    } else {
      userId = null;
    }

    const post = await this.commandBus.execute(
      new GetPostByIdCommand(+postId, userId),
    );
    res.status(HttpStatus.OK).send(post);
  }

  @Get('/:id/comments')
  async getPostComments(
    @Param('id') postId: string,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Re,
    @Query() query: PostsDefaultQuery,
  ) {
    let userId: number | null;
    if (req.cookies.refreshToken) {
      userId = await this.authService.getUserIdFromRefreshToken(
        req.cookies.refreshToken,
      );
    } else if (req.headers.authorization) {
      userId = await this.authService.getUserIdFromAccessToken(
        req.headers.authorization!,
      );
    } else {
      userId = null;
    }

    const comments = await this.commandBus.execute(
      new GetAllPostCommentCommand(query, +postId, userId),
    );
    res.status(HttpStatus.OK).send(comments);
  }

  @UseGuards(BearerAuthGuard)
  @Put('/:id/like-status')
  @HttpCode(204)
  async likesOperation(
    @Param('id') postId: string,
    @Body() dto: LikeStatusInputModel,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Re,
  ) {
    const checkPost = await this.postsRepo.getPostById(+postId);
    if (!checkPost) throw new NotFoundException();
    const userId = await this.authService.getUserIdFromAccessToken(
      req.headers.authorization!,
    );
    await this.commandBus.execute(
      new UpdatePostLikeStatusCommand(+postId, dto.likeStatus, +userId),
    );
    return true;
  }
}
