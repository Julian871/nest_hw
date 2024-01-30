import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepo } from '../../infrastructure/post-repo';

export class DeletePostCommand {
  constructor(
    public postId: number,
    public blogId: number,
  ) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(private readonly postsRepo: PostsRepo) {}

  async execute(command: DeletePostCommand) {
    return this.postsRepo.deletePostById(command.postId, command.blogId);
  }
}
