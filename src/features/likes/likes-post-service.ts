import { Injectable } from '@nestjs/common';
import { PostsRepository } from '../posts/infrastructure/posts-repository';

@Injectable()
export class LikesPostService {
  constructor(private readonly postsRepository: PostsRepository) {}

  async getLikeListToPost(postId: number) {
    const list = await this.postsRepository.getListLike(postId);
    return list.map((p) => {
      p.userId.toString();
      p.userLogin;
      p.addedAt.toISOString();
    });
  }

  async getMyStatusToPost(postId: number, userId: number | null) {
    if (userId === null) return 'None';
    const likeInfo = await this.postsRepository.getUserLikeInfoToPost(
      userId,
      postId,
    );
    if (!likeInfo) return 'None';
    return likeInfo.status;
  }

  async getLikeCount(postId: number) {
    return await this.postsRepository.countPostLike(postId);
  }

  async getDislikeCount(postId: number) {
    return await this.postsRepository.countPostDislike(postId);
  }
}
