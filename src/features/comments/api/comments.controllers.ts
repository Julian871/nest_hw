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
import { CommentsRepository } from '../infrastructure/comments-repository';
import { CreateCommentInputModel } from '../comments-model';
import { CommandBus } from '@nestjs/cqrs';
import { GetCommentCommand } from '../application/use-cases/get-comment-use-case';
import { UpdateCommentCommand } from '../application/use-cases/update-comment-use-case';
import { UpdateCommentLikeStatusCommand } from '../../likes/use-cases/update-comment-like-status-use-case';
import { AuthService } from '../../../security/auth-service';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly commentsRepository: CommentsRepository,
    private authService: AuthService,
    private commandBus: CommandBus,
  ) {}

  @Get(':id')
  async getComment(
    @Res({ passthrough: true }) res: Response,
    @Param('id') commentId: string,
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
    const comment = await this.commandBus.execute(
      new GetCommentCommand(commentId, userId),
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
    let userId: string | null;
    if (!req.headers.authorization) {
      userId = null;
    } else {
      userId = await this.authService.getUserIdFromAccessToken(
        req.headers.authorization,
      );
    }
    const checkComment =
      await this.commentsRepository.getCommentById(commentId);
    if (!checkComment) {
      res.status(404);
      return;
    }
    await this.commandBus.execute(
      new UpdateCommentLikeStatusCommand(commentId, dto.likeStatus, userId),
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
    const userId = await this.authService.getUserIdFromAccessToken(
      req.headers.authorization!,
    );
    const checkOwner = await this.commentsService.checkOwner(userId, commentId);
    if (checkOwner === null) {
      res.sendStatus(404);
      return;
    } else if (!checkOwner) {
      res.sendStatus(403);
      return;
    }
    await this.commandBus.execute(
      new UpdateCommentCommand(commentId, dto.content),
    );
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
    const userId = await this.authService.getUserIdFromAccessToken(
      req.headers.authorization!,
    );
    const checkOwner = await this.commentsService.checkOwner(userId, commentId);
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
