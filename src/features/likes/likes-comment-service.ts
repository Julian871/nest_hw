import { Injectable } from '@nestjs/common';
import { CommentsRepository } from '../comments/infrastructure/comments-repository';

@Injectable()
export class LikesCommentsService {
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async getMyStatusToComment(commentId: number, userId: number | null) {
    if (userId === null) return 'None';
    const likeInfo = await this.commentsRepository.getUserLikeInfoToComment(
      userId,
      commentId,
    );
    if (!likeInfo) return 'None';
    return likeInfo.status;
  }

  async getLikeCount(commentId: number) {
    const likeCount = await this.commentsRepository.countCommentLike(commentId);
    return +likeCount;
  }

  async getDislikeCount(commentId: number) {
    const dislikeCount =
      await this.commentsRepository.countCommentDislike(commentId);
    return +dislikeCount;
  }
}
