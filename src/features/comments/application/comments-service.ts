import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommentsRepository } from '../infrastructure/comments-repository';

@Injectable()
export class CommentsService {
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async checkOwner(userId: number, commentId: number) {
    const comment = await this.commentsRepository.getCommentById(commentId);
    if (!comment) throw new NotFoundException();
    if (userId === +comment.userId) throw new ForbiddenException();
    return;
  }
}
