import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../comment-entity';
import { CommentLike } from '../../likes/comment-like-entity';

@Injectable()
export class CommentsRepo {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    private readonly commentsLikeRepository: Repository<CommentLike>,
  ) {}

  saveComment(comment: Comment) {
    return this.commentsRepository.save(comment);
  }

  getCommentById(commentId: number) {
    return this.commentsRepository.findOneBy({ id: commentId });
  }

  getCountAllCommentsToPost(postId: number) {
    return this.commentsRepository.countBy({ postId });
  }

  async deleteCommentById(commentId: number) {
    const result = await this.commentsRepository.delete({ id: commentId });
    return result.affected;
  }

  getUserLikeInfoToComment(userId: number, commentId: number) {
    return this.commentsLikeRepository.findOneBy({ userId, commentId });
  }

  getCountLikeToComment(commentId: number) {
    return this.commentsLikeRepository.countBy({ commentId, status: 'Like' });
  }

  getCountDislikeToComment(commentId: number) {
    return this.commentsLikeRepository.countBy({
      commentId,
      status: 'Dislike',
    });
  }

  saveCommentLike(likeStatus: CommentLike) {
    return this.commentsRepository.save(likeStatus);
  }

  async deleteLikeOrDislikeInfo(likeId: number) {
    const result = await this.commentsLikeRepository.delete({ id: likeId });
    return result.affected;
  }
}
