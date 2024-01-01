import { BlogsRepository } from '../../infrastructure/blogs-repository';
import { CreateBlogInputModel } from '../../blogs-models';
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
    const newBlog = new BlogCreator(
      command.data.name,
      command.data.description,
      command.data.websiteUrl,
    );
    const blog = await this.blogsRepository.createNewBlog(newBlog);
    return new BlogInformation(
      blog._id.toString(),
      newBlog.name,
      newBlog.description,
      newBlog.websiteUrl,
      newBlog.createdAt,
      newBlog.isMembership,
    );
  }
}
