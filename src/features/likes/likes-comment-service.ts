import { Injectable } from '@nestjs/common';
import { PostsRepository } from '../posts/infrastructure/posts-repository';
import { UsersRepository } from '../users/infrastructure/users-repository';
import { CommentsRepository } from '../comments/infrastructure/comments-repository';

@Injectable()
export class LikesCommentsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly commentsRepository: CommentsRepository,
  ) {}

  async updateLikeStatus(
    commentId: string,
    likeStatus: string,
    userId: string | null,
  ) {
    if (userId === null) return;
    const checkOnLike = await this.commentsRepository.getLikeStatus(
      commentId,
      userId,
    );
    if (checkOnLike && likeStatus === 'None') {
      return await this.commentsRepository.updateLikeToNoneStatus(
        commentId,
        userId,
      );
    } else if (checkOnLike && likeStatus === 'Dislike') {
      return await this.commentsRepository.updateLikeToDislike(
        commentId,
        userId,
      );
    } else if (checkOnLike && likeStatus === 'Like') return;

    const checkDislike = await this.commentsRepository.getDislikeStatus(
      commentId,
      userId,
    );
    if (checkDislike && likeStatus === 'None') {
      return await this.commentsRepository.updateDislikeToNoneStatus(
        commentId,
        userId,
      );
    } else if (checkDislike && likeStatus === 'Like') {
      return await this.commentsRepository.updateDislikeToLike(
        commentId,
        userId,
      );
    } else if (checkDislike && likeStatus === 'Dislike') return;

    if (likeStatus === 'Like') {
      return await this.commentsRepository.updateLikeStatus(commentId, userId);
    }

    if (likeStatus === 'Dislike') {
      return await this.commentsRepository.updateDislikeStatus(
        commentId,
        userId,
      );
    }

    if (likeStatus === 'None') return;
  }

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
