import { Injectable } from '@nestjs/common';
import { CommentsRepository } from '../infrastructure/comments-repository';

@Injectable()
export class CommentsService {
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async checkOwner(userId: string | null, commentId: string) {
    const comment = await this.commentsRepository.getCommentById(commentId);
    if (!comment) return null;
    return userId === comment!.commentatorInfo.userId;
  }
}
