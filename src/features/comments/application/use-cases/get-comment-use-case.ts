import { CommentsRepository } from '../../infrastructure/comments-repository';
import { LikesCommentsService } from '../../../likes/likes-comment-service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';

export class GetCommentCommand {
  constructor(
    public commentId: number,
    public userId: number | null,
  ) {}
}

@CommandHandler(GetCommentCommand)
export class GetCommentUseCase implements ICommandHandler<GetCommentCommand> {
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly likesCommentService: LikesCommentsService,
  ) {}

  async execute(command: GetCommentCommand) {
    const commentInfo = await this.commentsRepository.getCommentById(
      command.commentId,
    );
    if (!commentInfo) throw new NotFoundException();

    return {
      id: commentInfo.id.toString(),
      content: commentInfo.content,
      commentatorInfo: {
        userId: commentInfo.userId.toString(),
        userLogin: commentInfo.userLogin,
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
