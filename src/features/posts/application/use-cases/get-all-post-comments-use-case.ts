import { PostsRepository } from '../../infrastructure/posts-repository';
import { LikesCommentsService } from '../../../likes/likes-comment-service';
import { PostsDefaultQuery } from '../../default-query';
import { CommentInformation } from '../../../comments/application/comments-output';
import { PageInformation } from '../../../page-information';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { CommentsRepository } from '../../../comments/infrastructure/comments-repository';

export class GetAllPostCommentCommand {
  constructor(
    public query: PostsDefaultQuery,
    public postId: number,
    public userId: number | null,
  ) {}
}

@CommandHandler(GetAllPostCommentCommand)
export class GetAllPostCommentUseCase
  implements ICommandHandler<GetAllPostCommentCommand>
{
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly commentsRepository: CommentsRepository,
    private readonly likesCommentsService: LikesCommentsService,
  ) {}

  async execute(command: GetAllPostCommentCommand) {
    const isFindPost = await this.postsRepository.getPostById(command.postId);
    if (!isFindPost) throw new NotFoundException();

    const countPostsComments = await this.commentsRepository.countCommentToPost(
      command.postId,
    );
    const allPostsComments = await this.commentsRepository.getAllCommentsToPost(
      command.query,
      command.postId,
    );

    const filterPostsComments = await Promise.all(
      allPostsComments.map(
        async (p) =>
          new CommentInformation(
            p.id,
            p.content,
            p.userId,
            p.login,
            p.createdAt,
            await this.likesCommentsService.getLikeCount(p.id),
            await this.likesCommentsService.getDislikeCount(p.id),
            await this.likesCommentsService.getMyStatusToComment(
              p.id,
              command.userId,
            ),
          ),
      ),
    );

    return new PageInformation(
      command.query.pageNumber,
      command.query.pageSize,
      countPostsComments,
      filterPostsComments,
    );
  }
}
