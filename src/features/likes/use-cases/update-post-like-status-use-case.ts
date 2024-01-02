import { PostsRepository } from '../../posts/infrastructure/posts-repository';
import { UsersRepository } from '../../users/infrastructure/users-repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class UpdatePostLikeStatusCommand {
  constructor(
    public postId: string,
    public likeStatus: string,
    public userId: string | null,
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
    if (command.userId === null) return;
    const user = await this.usersRepository.getUserById(command.userId);
    const newLike = {
      addedAt: new Date(),
      userId: command.userId,
      login: user?.accountData.login,
    };
    const checkOnLike = await this.postsRepository.getLikeStatus(
      command.postId,
      command.userId,
    );
    if (checkOnLike && command.likeStatus === 'None') {
      return await this.postsRepository.updateLikeToNoneStatus(
        command.postId,
        command.userId,
      );
    } else if (checkOnLike && command.likeStatus === 'Dislike') {
      return await this.postsRepository.updateLikeToDislike(
        command.postId,
        command.userId,
      );
    } else if (checkOnLike && command.likeStatus === 'Like') return true;

    const checkDislike = await this.postsRepository.getDislikeStatus(
      command.postId,
      command.userId,
    );
    if (checkDislike && command.likeStatus === 'None') {
      return await this.postsRepository.updateDislikeToNoneStatus(
        command.postId,
        command.userId,
      );
    } else if (checkDislike && command.likeStatus === 'Like') {
      return await this.postsRepository.updateDislikeToLike(
        command.postId,
        newLike,
        command.userId,
      );
    } else if (checkDislike && command.likeStatus === 'Dislike') return true;

    if (command.likeStatus === 'Like') {
      return await this.postsRepository.updateLikeStatus(
        command.postId,
        newLike,
      );
    }

    if (command.likeStatus === 'Dislike') {
      return await this.postsRepository.updateDislikeStatus(
        command.postId,
        command.userId,
      );
    }

    if (command.likeStatus === 'None') return true;
  }
}
