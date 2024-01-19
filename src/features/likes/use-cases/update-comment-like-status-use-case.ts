import { CommentsRepository } from '../../comments/infrastructure/comments-repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../users/infrastructure/users-repository';

export class UpdateCommentLikeStatusCommand {
  constructor(
    public commentId: number,
    public likeStatus: string,
    public userId: number,
  ) {}
}

@CommandHandler(UpdateCommentLikeStatusCommand)
export class UpdateCommentLikeStatusUseCase
  implements ICommandHandler<UpdateCommentLikeStatusCommand>
{
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(command: UpdateCommentLikeStatusCommand) {
    const infoLike = await this.commentsRepository.getUserLikeInfoToComment(
      command.userId,
      command.commentId,
    );

    const user = await this.usersRepository.getUserById(command.userId);
    if (infoLike === null && command.likeStatus === 'None') return;

    // if user didn't like or dislike post
    if (infoLike === null) {
      await this.commentsRepository.takeLikeOrDislike(
        command.commentId,
        command.likeStatus,
        command.userId,
        user[0].login,
      );
    }

    if (command.likeStatus === infoLike.status) return;

    // if user like in db differs from input like, delete there likeStatus in db
    await this.commentsRepository.deleteLikeOrDislikeInfo(infoLike.id);

    // if likeStatus = like or dislike, create new likeInfo
    if (command.likeStatus !== 'None') {
      await this.commentsRepository.takeLikeOrDislike(
        command.commentId,
        command.likeStatus,
        command.userId,
        user[0].login,
      );
    }
    return;
  }
}
