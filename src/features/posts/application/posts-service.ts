import { PostsRepository } from '../infrastructure/posts-repository';
import { PostsDefaultQuery } from '../default-query';
import { Injectable } from '@nestjs/common';
import { PageInformation } from '../../page-information';
import { CommentCreator } from '../../comments/application/comments-input';
import { CommentInformation } from '../../comments/application/comments-output';
import { UsersRepository } from '../../users/infrastructure/users-repository';
import { LikesCommentsService } from '../../likes/likes-comment-service';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly likesCommentsService: LikesCommentsService,
  ) {}

  async createNewPostComment(postId: string, content: string, userId: string) {
    const checkPost = await this.postsRepository.getPostById(postId);
    if (!checkPost) return false;
    const user = await this.usersRepository.getUserById(userId);
    const newComment = new CommentCreator(
      content,
      userId,
      user!.accountData.login,
      postId,
    );
    const comment = await this.postsRepository.createNewPostComment(newComment);
    return new CommentInformation(
      comment._id.toString(),
      content,
      userId,
      comment.commentatorInfo.userLogin,
      comment.createdAt.toString(),
      0,
      0,
      'None',
    );
  }

  async getAllPostsComments(query: PostsDefaultQuery, postId: string) {
    const isFindPost = await this.postsRepository.getPostById(postId);
    if (!isFindPost) return false;
    const countPostsComments =
      await this.postsRepository.countPostsComments(postId);
    const allPostsComments = await this.postsRepository.getAllPostsComments(
      query,
      postId,
    );
    const filterPostsComments = await Promise.all(
      allPostsComments.map(
        async (p) =>
          new CommentInformation(
            p._id.toString(),
            p.content,
            p.commentatorInfo.userId,
            p.commentatorInfo.userLogin,
            p.createdAt,
            p.likesInfo.countLike,
            p.likesInfo.countDislike,
            await this.likesCommentsService.getMyStatus(
              p._id.toString(),
              p.commentatorInfo.userId,
            ),
          ),
      ),
    );

    return new PageInformation(
      query.pageNumber,
      query.pageSize,
      countPostsComments,
      filterPostsComments,
    );
  }

  async deletePostById(id: string) {
    return this.postsRepository.deletePostById(id);
  }
}
