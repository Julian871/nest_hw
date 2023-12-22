import { Controller, Get, HttpStatus, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { CommentsService } from '../application/comments-service';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}
  @Get(':id')
  async createBlog(
    @Res({ passthrough: true }) res: Response,
    @Param('id') commentId: string,
  ) {
    const comment = await this.commentsService.getCommentById(commentId);
    if (!comment) {
      res.status(HttpStatus.NOT_FOUND);
    } else res.status(HttpStatus.OK).send(comment);
  }
}
