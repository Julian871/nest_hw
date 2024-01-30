import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
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
import { CreateCommentInputModel } from './comments-model';
import { CommandBus } from '@nestjs/cqrs';
import { GetCommentCommand } from '../application/use-cases/get-comment-use-case';
import { UpdateCommentCommand } from '../application/use-cases/update-comment-use-case';
import { UpdateCommentLikeStatusCommand } from '../../likes/application/use-cases/update-comment-like-status-use-case';
import { AuthService } from '../../../security/auth-service';
import { CommentsRepo } from '../infrastructure/comments-repo';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly commentsRepo: CommentsRepo,
    private authService: AuthService,
    private commandBus: CommandBus,
  ) {}

  @Get('/:id')
  async getComment(
    @Res({ passthrough: true }) res: Response,
    @Param('id') commentId: string,
    @Req() req: Re,
  ) {
    let userId: number | null;
    if (!req.cookies.refreshToken && !req.headers.authorization) {
      userId = null;
    }
    if (req.cookies.refreshToken) {
      userId = await this.authService.getUserIdFromRefreshToken(
        req.cookies.refreshToken,
      );
    } else {
      userId = await this.authService.getUserIdFromAccessToken(
        req.headers.authorization!,
      );
    }
    const comment = await this.commandBus.execute(
      new GetCommentCommand(+commentId, userId),
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
    @Req() req: Re,
  ) {
    const userId = await this.authService.getUserIdFromAccessToken(
      req.headers.authorization!,
    );

    const checkComment = await this.commentsRepo.getCommentById(+commentId);
    if (!checkComment) throw new NotFoundException();

    await this.commandBus.execute(
      new UpdateCommentLikeStatusCommand(+commentId, dto.likeStatus, userId),
    );
    return;
  }

  @UseGuards(BearerAuthGuard)
  @Put('/:id')
  @HttpCode(204)
  async updateComment(
    @Param('id') commentId: string,
    @Body() dto: CreateCommentInputModel,
    @Req() req: Re,
  ) {
    const userId = await this.authService.getUserIdFromAccessToken(
      req.headers.authorization!,
    );
    if (!userId) throw new ForbiddenException();

    await this.commentsService.checkOwner(+userId, +commentId);
    await this.commandBus.execute(
      new UpdateCommentCommand(+commentId, dto.content),
    );
    return;
  }

  @UseGuards(BearerAuthGuard)
  @Delete('/:id')
  @HttpCode(204)
  async deleteComment(@Param('id') commentId: string, @Req() req: Re) {
    const userId = await this.authService.getUserIdFromAccessToken(
      req.headers.authorization!,
    );
    if (!userId) throw new ForbiddenException();
    await this.commentsService.checkOwner(+userId, +commentId);

    await this.commentsRepo.deleteCommentById(+commentId);
    return true;
  }
}
