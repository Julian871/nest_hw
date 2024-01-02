import { CommentsRepository } from '../../comments/infrastructure/comments-repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class UpdateCommentLikeStatusCommand {
  constructor(
    public commentId: string,
    public likeStatus: string,
    public userId: string | null,
  ) {}
}

@CommandHandler(UpdateCommentLikeStatusCommand)
export class UpdateCommentLikeStatusUseCase
  implements ICommandHandler<UpdateCommentLikeStatusCommand>
{
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async execute(command: UpdateCommentLikeStatusCommand) {
    if (command.userId === null) return;
    const checkOnLike = await this.commentsRepository.getLikeStatus(
      command.commentId,
      command.userId,
    );
    if (checkOnLike && command.likeStatus === 'None') {
      return await this.commentsRepository.updateLikeToNoneStatus(
        command.commentId,
        command.userId,
      );
    } else if (checkOnLike && command.likeStatus === 'Dislike') {
      return await this.commentsRepository.updateLikeToDislike(
        command.commentId,
        command.userId,
      );
    } else if (checkOnLike && command.likeStatus === 'Like') return;

    const checkDislike = await this.commentsRepository.getDislikeStatus(
      command.commentId,
      command.userId,
    );
    if (checkDislike && command.likeStatus === 'None') {
      return await this.commentsRepository.updateDislikeToNoneStatus(
        command.commentId,
        command.userId,
      );
    } else if (checkDislike && command.likeStatus === 'Like') {
      return await this.commentsRepository.updateDislikeToLike(
        command.commentId,
        command.userId,
      );
    } else if (checkDislike && command.likeStatus === 'Dislike') return;

    if (command.likeStatus === 'Like') {
      return await this.commentsRepository.updateLikeStatus(
        command.commentId,
        command.userId,
      );
    }

    if (command.likeStatus === 'Dislike') {
      return await this.commentsRepository.updateDislikeStatus(
        command.commentId,
        command.userId,
      );
    }

    if (command.likeStatus === 'None') return;
  }
}
