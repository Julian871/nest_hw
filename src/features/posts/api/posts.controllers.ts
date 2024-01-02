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
import { PostsRepository } from '../infrastructure/posts-repository';
import { CreateCommentInputModel } from '../../comments/comments-model';
import { CreatePostInputModel } from '../posts-models';
import { ConnectGuard } from '../../../security/connect-guard';
import { ObjectIdPipe } from '../../../pipes/objectID.pipe';
import { CommandBus } from '@nestjs/cqrs';
import { CreatePostCommand } from '../application/use-cases/create-post-use-case';
import { GetAllPostsCommand } from '../application/use-cases/get-all-posts-use-case';
import { GetPostByIdCommand } from '../application/use-cases/get-post-by-id-use-case';
import { UpdatePostCommand } from '../application/use-cases/update-post-use-case';
import { DeletePostCommand } from '../application/use-cases/delete-post-use-case';
import { CreatePostCommentCommand } from '../application/use-cases/create-post-comment-use-case';
import { GetAllPostCommentCommand } from '../application/get-all-posts-use-case';

@UseGuards(ConnectGuard)
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly likesService: LikesPostService,
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
      new CreatePostCommentCommand(postId, dto.content, req.connect.userId),
    );
    if (!comment) {
      res.sendStatus(404);
      return;
    }
    return comment;
  }

  @Get()
  async getPosts(@Query() query: PostsDefaultQuery, @Req() req: Re) {
    return await this.commandBus.execute(
      new GetAllPostsCommand(query, req.connect.userId),
    );
  }

  @Get('/:id')
  async getPost(
    @Param('id', ObjectIdPipe) postId: string,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Re,
  ) {
    const post = await this.commandBus.execute(
      new GetPostByIdCommand(postId, req.connect.userId),
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

  @UseGuards(BasicAuthGuard)
  @Put('/:id')
  async updatePost(
    @Param('id', ObjectIdPipe) postId: string,
    @Body() dto: CreatePostInputModel,
    @Res({ passthrough: true }) res: Response,
  ) {
    const isUpdate = await this.commandBus.execute(
      new UpdatePostCommand(postId, dto),
    );
    if (!isUpdate) {
      res.status(HttpStatus.NOT_FOUND);
    } else res.status(HttpStatus.NO_CONTENT);
  }

  @UseGuards(BearerAuthGuard)
  @Put('/:id/like-status')
  @HttpCode(204)
  async likesOperation(
    @Param('id', ObjectIdPipe) postId: string,
    @Body() likeStatus: LikeStatusInputModel,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Re,
  ) {
    const checkPost = await this.postsRepository.getPostById(postId);
    if (!checkPost) {
      res.status(404);
      return;
    }
    await this.likesService.updateLikeStatus(
      postId,
      likeStatus.likeStatus,
      req.connect.userId,
    );
    return true;
  }

  @UseGuards(BasicAuthGuard)
  @Delete('/:id')
  async deletePost(
    @Param('id', ObjectIdPipe) postId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const isDelete = await this.commandBus.execute(
      new DeletePostCommand(postId),
    );
    if (!isDelete) {
      res.status(HttpStatus.NOT_FOUND);
    } else res.status(HttpStatus.NO_CONTENT);
  }
}
