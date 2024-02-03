import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../post-entity';
import { PostLike } from '../../likes/post-like-entity';

@Injectable()
export class PostsRepo {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    @InjectRepository(PostLike)
    private readonly postsLikeRepository: Repository<PostLike>,
  ) {}

  savePost(post: Post) {
    return this.postsRepository.save(post);
  }

  getPostById(postId: number) {
    return this.postsRepository.findOneBy({ id: postId });
  }

  getPostByPostIdAndBlogId(postId: number, blogId: number) {
    return this.postsRepository.findOneBy({ id: postId, blogId });
  }

  getCountAllPosts() {
    return this.postsRepository.count({});
  }

  getCountAllPostsByBlogId(blogId: number) {
    return this.postsRepository.countBy({ blogId });
  }

  async deletePostById(postId: number, blogId: number) {
    const result = await this.postsRepository.delete({ id: postId, blogId });
    return result.affected;
  }

  getUserLikeInfoToPost(userId: number, postId: number) {
    return this.postsLikeRepository.findOneBy({ userId, postId });
  }

  getCountLikeToPost(postId: number) {
    return this.postsLikeRepository.countBy({ postId: postId, status: 'Like' });
  }

  getCountDislikeToPost(postId: number) {
    return this.postsLikeRepository.countBy({
      postId: postId,
      status: 'Dislike',
    });
  }

  savePostLike(likeStatus: PostLike) {
    return this.postsLikeRepository.save(likeStatus);
  }

  async deleteLikeOrDislikeInfo(likeId: number) {
    const result = await this.postsLikeRepository.delete({ id: likeId });
    return result.affected;
  }
}
