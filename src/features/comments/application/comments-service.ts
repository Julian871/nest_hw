import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommentsRepo } from '../infrastructure/comments-repo';

@Injectable()
export class CommentsService {
  constructor(private readonly commentsRepo: CommentsRepo) {}

  async checkOwner(userId: number, commentId: number) {
    const comment = await this.commentsRepo.getCommentById(commentId);
    if (!comment) throw new NotFoundException();
    if (userId !== +comment.owner.id) throw new ForbiddenException();
    return;
  }
}
