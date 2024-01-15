import { BlogsRepository } from '../../infrastructure/blogs-repository';
import { UpdateBlogInputModel } from '../../api/blogs-dto-models';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

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
    return await this.blogsRepository.updateBlogById(
      command.blogId,
      command.dto,
    );
  }
}
