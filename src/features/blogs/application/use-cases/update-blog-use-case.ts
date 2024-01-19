import { BlogsRepository } from '../../infrastructure/blogs-repository';
import { UpdateBlogInputModel } from '../../api/blogs-dto-models';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';

export class UpdateBlogCommand {
  constructor(
    public blogId: string,
    public dto: UpdateBlogInputModel,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(command: UpdateBlogCommand) {
    const isUpdate = await this.blogsRepository.updateBlogById(
      command.blogId,
      command.dto,
    );
    if (!isUpdate) throw new NotFoundException();
    return;
  }
}
