import { Injectable } from '@nestjs/common';
import { PostsRepo } from '../../posts/infrastructure/post-repo';
import { PostsQueryRepo } from '../../posts/infrastructure/post-query-repo';

@Injectable()
export class LikesPostService {
  constructor(
    private readonly postsRepo: PostsRepo,
    private readonly postsQueryRepo: PostsQueryRepo,
  ) {}

  async getLikeListToPost(postId: number) {
    const list = await this.postsQueryRepo.getListLike(postId);
    return list.map((p) => {
      return {
        userId: p.owner.id.toString(),
        login: p.owner.login,
        addedAt: p.addedAt.toISOString(),
      };
    });
  }

  async getMyStatusToPost(postId: number, userId: number | null) {
    if (userId === null) return 'None';
    const likeInfo = await this.postsRepo.getUserLikeInfoToPost(userId, postId);
    if (!likeInfo) return 'None';
    return likeInfo.status;
  }

  async getLikeCount(postId: number) {
    return await this.postsRepo.getCountLikeToPost(postId);
  }

  async getDislikeCount(postId: number) {
    return await this.postsRepo.getCountDislikeToPost(postId);
  }
}
