import { Injectable } from '@nestjs/common';
import { CommentsRepository } from '../infrastructure/comments-repository';
import { LikesCommentsService } from '../../likes/likes-comment-service';
import { AuthService } from '../../auth/application/auth-service';

@Injectable()
export class CommentsService {
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly likesCommentService: LikesCommentsService,
    private readonly authService: AuthService,
  ) {}

  async getCommentById(id: string) {
    const commentInfo = await this.commentsRepository.getCommentById(id);
    if (!commentInfo) return false;

    return {
      id: commentInfo._id.toString(),
      content: commentInfo.content,
      commentatorInfo: {
        userId: commentInfo.commentatorInfo.userId,
        userLogin: commentInfo.commentatorInfo.userLogin,
      },
      createdAt: commentInfo.createdAt,
      likesInfo: {
        likesCount: commentInfo.likesInfo.countLike,
        dislikesCount: commentInfo.likesInfo.countDislike,
        myStatus: await this.likesCommentService.getMyStatus(
          commentInfo._id.toString(),
          commentInfo.commentatorInfo.userId,
        ),
      },
    };
  }

  async checkOwner(bearerToken: string, commentId: string) {
    const userId = await this.authService.getUserIdFromAccessToken(bearerToken);
    const comment = await this.commentsRepository.getCommentById(commentId);
    if (!comment) return null;
    return userId === comment!.commentatorInfo.userId;
  }

  async updateCommentById(commentId: string, content: string) {
    return await this.commentsRepository.updateCommentById(commentId, content);
  }
}
