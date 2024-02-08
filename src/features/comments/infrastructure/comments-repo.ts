import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../../../entities/comment-entity';
import { CommentLike } from '../../../entities/comment-like-entity';

@Injectable()
export class CommentsRepo {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    @InjectRepository(CommentLike)
    private readonly commentsLikeRepository: Repository<CommentLike>,
  ) {}

  saveComment(comment: Comment) {
    return this.commentsRepository.save(comment);
  }

  async getCommentById(commentId: number) {
    return this.commentsRepository.findOne({
      where: { id: commentId },
      relations: ['owner'],
    });
  }

  getCountAllCommentsToPost(postId: number) {
    return this.commentsRepository.countBy({ post: { id: postId } });
  }

  async deleteCommentById(commentId: number) {
    const result = await this.commentsRepository.delete({ id: commentId });
    return result.affected;
  }

  async getUserLikeInfoToComment(userId: number, commentId: number) {
    return this.commentsLikeRepository.findOne({
      where: {
        comment: { id: commentId },
        owner: {
          id: userId,
        },
      },
      relations: ['owner'],
    });
  }

  getCountLikeToComment(commentId: number) {
    return this.commentsLikeRepository.countBy({
      comment: { id: commentId },
      status: 'Like',
    });
  }

  getCountDislikeToComment(commentId: number) {
    return this.commentsLikeRepository.countBy({
      comment: { id: commentId },
      status: 'Dislike',
    });
  }

  saveCommentLike(likeStatus: CommentLike) {
    return this.commentsLikeRepository.save(likeStatus);
  }

  async deleteLikeOrDislikeInfo(likeId: number) {
    const result = await this.commentsLikeRepository.delete({ id: likeId });
    return result.affected;
  }
}
