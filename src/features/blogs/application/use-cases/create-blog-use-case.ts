import { BlogsRepository } from '../../infrastructure/blogs-repository';
import { CreateBlogInputModel } from '../../api/blogs-dto-models';
import { BlogCreator } from '../blogs-input';
import { BlogInformation } from '../blogs-output';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class CreateBlogCommand {
  constructor(public data: CreateBlogInputModel) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(command: CreateBlogCommand) {
    const blog = await this.blogsRepository.createNewBlog(
      command.data.name,
      command.data.description,
      command.data.websiteUrl,
    );
    return new BlogInformation(
      blog[0].id.toString(),
      command.data.name,
      command.data.description,
      command.data.websiteUrl,
      blog[0].createdAt,
      false,
    );
  }
}
