import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepo } from '../../../users/infrastructure/users-repo';
import { PostsRepo } from '../../../posts/infrastructure/post-repo';
import { PostLike } from '../../post-like-entity';

export class UpdatePostLikeStatusCommand {
  constructor(
    public postId: number,
    public likeStatus: string,
    public userId: number,
  ) {}
}

@CommandHandler(UpdatePostLikeStatusCommand)
export class UpdatePostLikeStatusUseCase
  implements ICommandHandler<UpdatePostLikeStatusCommand>
{
  constructor(
    private readonly postsRepo: PostsRepo,
    private readonly usersRepo: UsersRepo,
  ) {}

  async execute(command: UpdatePostLikeStatusCommand) {
    const infoLike = await this.postsRepo.getUserLikeInfoToPost(
      command.userId,
      command.postId,
    );
    const user = await this.usersRepo.checkUser(command.userId);
    if (!infoLike && command.likeStatus === 'None') return;

    const takeLikeOrDislike = new PostLike();
    takeLikeOrDislike.postId = command.postId;
    takeLikeOrDislike.status = command.likeStatus;
    takeLikeOrDislike.userId = command.userId;
    takeLikeOrDislike.userLogin = user!.login;
    takeLikeOrDislike.addedAt = new Date();

    // if user didn't like or dislike post
    if (!infoLike) {
      await this.postsRepo.savePostLike(takeLikeOrDislike);
      return;
    }

    if (command.likeStatus === infoLike.status) return;

    // if user like in db differs from input like, delete there likeStatus in db
    await this.postsRepo.deleteLikeOrDislikeInfo(infoLike.id);

    // if likeStatus = like or dislike, create new likeInfo
    if (command.likeStatus !== 'None') {
      await this.postsRepo.savePostLike(takeLikeOrDislike);
      return;
    }
    return;
  }
}
