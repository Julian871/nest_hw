import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepo } from '../../infrastructure/blogs-repo';
import { NotFoundException } from '@nestjs/common';

export class DeleteBLogCommand {
  constructor(public blogId: number) {}
}

@CommandHandler(DeleteBLogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBLogCommand> {
  constructor(private readonly blogsRepo: BlogsRepo) {}

  async execute(command: DeleteBLogCommand) {
    const isDelete = await this.blogsRepo.deleteBlogById(command.blogId);
    if (!isDelete) throw new NotFoundException();
  }
}
