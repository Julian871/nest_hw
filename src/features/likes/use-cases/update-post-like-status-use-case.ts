import { PostsRepository } from '../../posts/infrastructure/posts-repository';
import { UsersRepository } from '../../users/infrastructure/users-repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

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
    private readonly postsRepository: PostsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(command: UpdatePostLikeStatusCommand) {
    const infoLike = await this.postsRepository.getUserLikeInfoToPost(
      command.userId,
      command.postId,
    );
    const user = await this.usersRepository.getUserById(command.userId);
    if (infoLike.length === 0 && command.likeStatus === 'None') return;

    // if user didn't like or dislike post
    if (infoLike.length === 0) {
      await this.postsRepository.takeLikeOrDislike(
        command.postId,
        command.likeStatus,
        command.userId,
        user[0].login,
      );
      return;
    }

    if (command.likeStatus === infoLike[0].status) return;

    // if user like in db differs from input like, delete there likeStatus in db
    await this.postsRepository.deleteLikeOrDislikeInfo(infoLike[0].id);

    // if likeStatus = like or dislike, create new likeInfo
    if (command.likeStatus !== 'None') {
      await this.postsRepository.takeLikeOrDislike(
        command.postId,
        command.likeStatus,
        command.userId,
        user[0].login,
      );
    }
    return;
  }
}
