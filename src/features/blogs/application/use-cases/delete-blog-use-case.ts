import { BlogsRepository } from '../../infrastructure/blogs-repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class DeleteBLogCommand {
  constructor(public blogId: string) {}
}

@CommandHandler(DeleteBLogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBLogCommand> {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(command: DeleteBLogCommand) {
    return await this.blogsRepository.deleteBlogById(command.blogId);
  }
}
