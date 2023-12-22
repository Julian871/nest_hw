import { Injectable } from '@nestjs/common';
import { CommentsRepository } from '../infrastructure/comments-repository';

@Injectable()
export class CommentsService {
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async getCommentById(id: string) {
    const commentInfo = await this.commentsRepository.getCommentById(id);
    if (!commentInfo) return false;

    return {
      id: commentInfo._id.toString(),
      content: commentInfo.content,
      commentatorInfo: commentInfo.commentatorInfo,
      createdAt: commentInfo.createdAt,
      likesInfo: {
        likesCount: commentInfo.likesInfo.countLike,
        dislikesCount: commentInfo.likesInfo.countDislike,
        myStatus: 'None',
      },
    };
  }
}
