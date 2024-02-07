import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepo } from '../../../users/infrastructure/users-repo';
import { CommentsRepo } from '../../../comments/infrastructure/comments-repo';
import { CommentLike } from '../../../../entities/comment-like-entity';

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
    private readonly commentsRepo: CommentsRepo,
    private readonly usersRepo: UsersRepo,
  ) {}

  async execute(command: UpdateCommentLikeStatusCommand) {
    const infoLike = await this.commentsRepo.getUserLikeInfoToComment(
      command.userId,
      command.commentId,
    );

    const user = await this.usersRepo.checkUser(command.userId);
    if (!infoLike && command.likeStatus === 'None') return;

    const takeLikeOrDislike = new CommentLike();
    takeLikeOrDislike.commentId = command.commentId;
    takeLikeOrDislike.status = command.likeStatus;
    takeLikeOrDislike.userId = command.userId;
    takeLikeOrDislike.userLogin = user!.login;
    takeLikeOrDislike.addedAt = new Date();

    // if user didn't like or dislike post
    if (!infoLike) {
      await this.commentsRepo.saveCommentLike(takeLikeOrDislike);
      return;
    }

    if (command.likeStatus === infoLike[0].status) return;

    // if user like in db differs from input like, delete there likeStatus in db
    await this.commentsRepo.deleteLikeOrDislikeInfo(infoLike.id);

    // if likeStatus = like or dislike, create new likeInfo
    if (command.likeStatus !== 'None') {
      await this.commentsRepo.saveCommentLike(takeLikeOrDislike);
    }
    return;
  }
}
