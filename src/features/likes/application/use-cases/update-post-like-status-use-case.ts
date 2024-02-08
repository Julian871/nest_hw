import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepo } from '../../../posts/infrastructure/post-repo';
import { PostLike } from '../../../../entities/post-like-entity';
import { UsersRepo } from '../../../users/infrastructure/users-repo';

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

    if (!infoLike && command.likeStatus === 'None') return;
    const user = await this.usersRepo.checkUser(command.userId);
    const post = await this.postsRepo.getPostById(command.postId);

    const takeLikeOrDislike = new PostLike();
    takeLikeOrDislike.status = command.likeStatus;
    takeLikeOrDislike.addedAt = new Date();
    takeLikeOrDislike.owner = user!;
    takeLikeOrDislike.post = post!;

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
