import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request as Re, Response } from 'express';
import { CommentsService } from '../application/comments-service';
import { BearerAuthGuard } from '../../../security/auth-guard';
import { LikeStatusInputModel } from '../../likes/likes-models';
import { AuthService } from '../../../security/auth-service';
import { CommentsRepository } from '../infrastructure/comments-repository';
import { LikesCommentsService } from '../../likes/likes-comment-service';
import { CreateCommentInputModel } from '../comments-model';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly commentsRepository: CommentsRepository,
    private readonly authService: AuthService,
    private readonly likesCommentService: LikesCommentsService,
  ) {}
  @Get(':id')
  async getComment(
    @Res({ passthrough: true }) res: Response,
    @Param('id') commentId: string,
    @Req() req: Re,
  ) {
    const userId =
      (await this.authService.getUserIdFromAccessToken(
        req.headers.authorization!,
      )) ??
      (await this.authService.getUserIdFromRefreshToken(
        req.cookies.refreshToken,
      ));
    const comment = await this.commentsService.getCommentById(
      commentId,
      userId,
    );
    if (!comment) {
      res.status(HttpStatus.NOT_FOUND);
    } else res.status(HttpStatus.OK).send(comment);
  }

  @UseGuards(BearerAuthGuard)
  @Put('/:id/like-status')
  @HttpCode(204)
  async likesOperation(
    @Param('id') commentId: string,
    @Body() dto: LikeStatusInputModel,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Re,
  ) {
    const userId = await this.authService.getUserIdFromAccessToken(
      req.headers.authorization!,
    );
    const checkComment =
      await this.commentsRepository.getCommentById(commentId);
    if (!checkComment) {
      res.status(404);
      return;
    }
    await this.likesCommentService.updateLikeStatus(
      commentId,
      dto.likeStatus,
      userId,
    );
    return true;
  }

  @UseGuards(BearerAuthGuard)
  @Put('/:id')
  @HttpCode(204)
  async updateComment(
    @Param('id') commentId: string,
    @Body() dto: CreateCommentInputModel,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Re,
  ) {
    const checkOwner = await this.commentsService.checkOwner(
      req.headers.authorization!,
      commentId,
    );
    if (checkOwner === null) {
      res.sendStatus(404);
      return;
    } else if (!checkOwner) {
      res.sendStatus(403);
      return;
    }
    await this.commentsService.updateCommentById(commentId, dto.content);
    return true;
  }

  @UseGuards(BearerAuthGuard)
  @Delete('/:id')
  @HttpCode(204)
  async deleteComment(
    @Param('id') commentId: string,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Re,
  ) {
    const checkOwner = await this.commentsService.checkOwner(
      req.headers.authorization!,
      commentId,
    );
    if (checkOwner === null) {
      res.sendStatus(404);
      return;
    } else if (!checkOwner) {
      res.sendStatus(403);
      return;
    }
    await this.commentsRepository.deleteCommentById(commentId);
    return true;
  }
}
