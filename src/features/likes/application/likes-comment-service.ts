import { Injectable } from '@nestjs/common';
import { CommentsRepo } from '../../comments/infrastructure/comments-repo';

@Injectable()
export class LikesCommentsService {
  constructor(private readonly commentsRepo: CommentsRepo) {}

  async getMyStatusToComment(commentId: number, userId: number | null) {
    if (userId === null) return 'None';
    const likeInfo = await this.commentsRepo.getUserLikeInfoToComment(
      userId,
      commentId,
    );
    if (!likeInfo) return 'None';
    return likeInfo.status;
  }

  async getLikeCount(commentId: number) {
    return await this.commentsRepo.getCountLikeToComment(commentId);
  }

  async getDislikeCount(commentId: number) {
    return await this.commentsRepo.getCountDislikeToComment(commentId);
  }
}
