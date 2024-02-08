import { LikesCommentsService } from '../../../likes/application/likes-comment-service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { CommentsRepo } from '../../infrastructure/comments-repo';

export class GetCommentCommand {
  constructor(
    public commentId: number,
    public userId: number | null,
  ) {}
}

@CommandHandler(GetCommentCommand)
export class GetCommentUseCase implements ICommandHandler<GetCommentCommand> {
  constructor(
    private readonly commentsRepo: CommentsRepo,
    private readonly likesCommentService: LikesCommentsService,
  ) {}

  async execute(command: GetCommentCommand) {
    const commentInfo = await this.commentsRepo.getCommentById(
      command.commentId,
    );
    if (!commentInfo) throw new NotFoundException();

    return {
      id: commentInfo.id.toString(),
      content: commentInfo.content,
      commentatorInfo: {
        userId: commentInfo.owner.id.toString(),
        userLogin: commentInfo.owner.login,
      },
      createdAt: commentInfo.createdAt.toISOString(),
      likesInfo: {
        likesCount: await this.likesCommentService.getLikeCount(
          command.commentId,
        ),
        dislikesCount: await this.likesCommentService.getDislikeCount(
          command.commentId,
        ),
        myStatus: await this.likesCommentService.getMyStatusToComment(
          command.commentId,
          command.userId,
        ),
      },
    };
  }
}
