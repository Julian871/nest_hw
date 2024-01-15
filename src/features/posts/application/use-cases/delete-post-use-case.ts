import { PostsRepository } from '../../infrastructure/posts-repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class DeletePostCommand {
  constructor(
    public postId: string,
    public blogId: string,
  ) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(private readonly postsRepository: PostsRepository) {}

  async execute(command: DeletePostCommand) {
    return this.postsRepository.deletePostById(command.postId, command.blogId);
  }
}
