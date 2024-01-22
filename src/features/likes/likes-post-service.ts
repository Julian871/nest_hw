import { Injectable } from '@nestjs/common';
import { PostsRepository } from '../posts/infrastructure/posts-repository';

@Injectable()
export class LikesPostService {
  constructor(private readonly postsRepository: PostsRepository) {}

  async getLikeListToPost(postId: number) {
    const list = await this.postsRepository.getListLike(postId);
    return list.map((p) => {
      return {
        userId: p.userId.toString(),
        userLogin: p.userLogin,
        addedAt: p.addedAt.toISOString(),
      };
    });
  }

  async getMyStatusToPost(postId: number, userId: number | null) {
    if (userId === null) return 'None';
    const likeInfo = await this.postsRepository.getUserLikeInfoToPost(
      userId,
      postId,
    );
    if (!likeInfo) return 'None';
    return likeInfo[0].status;
  }

  async getLikeCount(postId: number) {
    return await this.postsRepository.countPostLike(postId);
  }

  async getDislikeCount(postId: number) {
    return await this.postsRepository.countPostDislike(postId);
  }
}
