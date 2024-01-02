import { Injectable } from '@nestjs/common';
import { PostsRepository } from '../posts/infrastructure/posts-repository';

@Injectable()
export class LikesPostService {
  constructor(private readonly postsRepository: PostsRepository) {}

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
