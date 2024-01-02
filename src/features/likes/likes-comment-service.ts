import { Injectable } from '@nestjs/common';
import { CommentsRepository } from '../comments/infrastructure/comments-repository';

@Injectable()
export class LikesCommentsService {
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async getMyStatus(commentId: string, userId: string | null) {
    if (userId === null) return 'None';

    const checkLikeStatus = await this.commentsRepository.getLikeStatus(
      commentId,
      userId,
    );
    if (checkLikeStatus) return 'Like';

    const checkDislikeStatus = await this.commentsRepository.getDislikeStatus(
      commentId,
      userId,
    );
    if (checkDislikeStatus) return 'Dislike';
    return 'None';
  }
}
