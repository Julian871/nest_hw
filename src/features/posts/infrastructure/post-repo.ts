import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../../../entities/post-entity';
import { PostLike } from '../../../entities/post-like-entity';

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
    return this.postsRepository.findOne({
      where: {
        id: postId,
      },
      relations: ['blog'],
    });
  }

  getPostByPostIdAndBlogId(postId: number, blogId: number) {
    return this.postsRepository.findOneBy({ id: postId, blog: { id: blogId } });
  }

  getCountAllPosts() {
    return this.postsRepository.count({});
  }

  getCountAllPostsByBlogId(blogId: number) {
    return this.postsRepository.countBy({ blog: { id: blogId } });
  }

  async deletePostById(postId: number, blogId: number) {
    const result = await this.postsRepository.delete({
      id: postId,
      blog: { id: blogId },
    });
    return result.affected;
  }

  getUserLikeInfoToPost(userId: number, postId: number) {
    return this.postsLikeRepository.findOne({
      where: {
        post: { id: postId },
        owner: {
          id: userId,
        },
      },
      relations: ['owner'],
    });
  }

  getCountLikeToPost(postId: number) {
    return this.postsLikeRepository.countBy({
      post: { id: postId },
      status: 'Like',
    });
  }

  getCountDislikeToPost(postId: number) {
    return this.postsLikeRepository.countBy({
      post: { id: postId },
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
