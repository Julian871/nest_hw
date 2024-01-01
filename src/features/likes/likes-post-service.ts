import { Injectable } from '@nestjs/common';
import { PostsRepository } from '../posts/infrastructure/posts-repository';
import { UsersRepository } from '../users/infrastructure/users-repository';

@Injectable()
export class LikesPostService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async updateLikeStatus(
    postId: string,
    likeStatus: string,
    userId: string | null,
  ) {
    if (userId === null) return;
    const user = await this.usersRepository.getUserById(userId);
    const newLike = {
      addedAt: new Date(),
      userId: userId,
      login: user?.accountData.login,
    };
    const checkOnLike = await this.postsRepository.getLikeStatus(
      postId,
      userId,
    );
    if (checkOnLike && likeStatus === 'None') {
      return await this.postsRepository.updateLikeToNoneStatus(postId, userId);
    } else if (checkOnLike && likeStatus === 'Dislike') {
      return await this.postsRepository.updateLikeToDislike(postId, userId);
    } else if (checkOnLike && likeStatus === 'Like') return true;

    const checkDislike = await this.postsRepository.getDislikeStatus(
      postId,
      userId,
    );
    if (checkDislike && likeStatus === 'None') {
      return await this.postsRepository.updateDislikeToNoneStatus(
        postId,
        userId,
      );
    } else if (checkDislike && likeStatus === 'Like') {
      return await this.postsRepository.updateDislikeToLike(
        postId,
        newLike,
        userId,
      );
    } else if (checkDislike && likeStatus === 'Dislike') return true;

    if (likeStatus === 'Like') {
      return await this.postsRepository.updateLikeStatus(postId, newLike);
    }

    if (likeStatus === 'Dislike') {
      return await this.postsRepository.updateDislikeStatus(postId, userId);
    }

    if (likeStatus === 'None') return true;
  }

  async getLikeListToPost(postId: string) {
    const post = await this.postsRepository.getLikeListToPost(postId);
    if (!post) return;
    return post.extendedLikesInfo.likeList.reverse();
  }

  async getMyStatusToPost(postId: string, userId: string | null) {
    if (!userId) return 'None';

    const checkLikeStatus = await this.postsRepository.getLikeStatus(
      postId,
      userId,
    );
    if (checkLikeStatus) return 'Like';

    const checkDislikeStatus = await this.postsRepository.getDislikeStatus(
      postId,
      userId,
    );
    if (checkDislikeStatus) return 'Dislike';
    return 'None';
  }
}
