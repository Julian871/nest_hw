import { PostsRepository } from '../../infrastructure/posts-repository';
import { UpdatePostInputModel } from '../../api/posts-models';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class UpdatePostCommand {
  constructor(
    public postId: string,
    public blogId: string,
    public dto: UpdatePostInputModel,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(private readonly postsRepository: PostsRepository) {}

  async execute(command: UpdatePostCommand) {
    return this.postsRepository.updatePostById(
      command.postId,
      command.blogId,
      command.dto,
    );
  }
}
