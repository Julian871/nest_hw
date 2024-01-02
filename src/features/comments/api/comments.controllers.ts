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
import { ConnectGuard } from '../../../security/connect-guard';
import { CommandBus } from '@nestjs/cqrs';
import { GetCommentCommand } from '../application/use-cases/get-comment-use-case';
import { UpdateCommentCommand } from '../application/use-cases/update-comment-use-case';
import { UpdateCommentLikeStatusCommand } from '../../likes/use-cases/update-comment-like-status-use-case';

@UseGuards(ConnectGuard)
@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly commentsRepository: CommentsRepository,
    private commandBus: CommandBus,
  ) {}
  @Get(':id')
  async getComment(
    @Res({ passthrough: true }) res: Response,
    @Param('id') commentId: string,
    @Req() req: Re,
  ) {
    const comment = await this.commandBus.execute(
      new GetCommentCommand(commentId, req.connect.userId),
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
    const checkComment =
      await this.commentsRepository.getCommentById(commentId);
    if (!checkComment) {
      res.status(404);
      return;
    }
    await this.commandBus.execute(
      new UpdateCommentLikeStatusCommand(
        commentId,
        dto.likeStatus,
        req.connect.userId,
      ),
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
      req.connect.userId,
      commentId,
    );
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
    const checkOwner = await this.commentsService.checkOwner(
      req.connect.userId,
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
