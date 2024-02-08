import { LikesCommentsService } from '../../../likes/application/likes-comment-service';
import { PostsDefaultQuery } from '../../default-query';
import { CommentInformation } from '../../../comments/application/comments-output';
import { PageInformation } from '../../../page-information';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PostsRepo } from '../../infrastructure/post-repo';
import { CommentsRepo } from '../../../comments/infrastructure/comments-repo';
import { CommentsQueryRepo } from '../../../comments/infrastructure/comments-query-repo';

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
    private readonly postsRepo: PostsRepo,
    private readonly commentsQueryRepo: CommentsQueryRepo,
    private readonly commentsRepo: CommentsRepo,
    private readonly likesCommentsService: LikesCommentsService,
  ) {}

  async execute(command: GetAllPostCommentCommand) {
    const isFindPost = await this.postsRepo.getPostById(command.postId);
    if (!isFindPost) throw new NotFoundException();

    const countPostsComments =
      await this.commentsRepo.getCountAllCommentsToPost(command.postId);
    const allPostsComments = await this.commentsQueryRepo.getAllCommentsToPost(
      command.query,
      command.postId,
    );

    const filterPostsComments = await Promise.all(
      allPostsComments.map(
        async (p) =>
          new CommentInformation(
            p.id,
            p.content,
            p.owner.id,
            p.owner.login,
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
