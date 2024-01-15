import { BlogsRepository } from '../../infrastructure/blogs-repository';
import { BlogInformation } from '../blogs-output';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class GetBlogByIdCommand {
  constructor(public blogId: string) {}
}

@CommandHandler(GetBlogByIdCommand)
export class GetBlogByIdUseCase implements ICommandHandler<GetBlogByIdCommand> {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(command: GetBlogByIdCommand) {
    const blog = await this.blogsRepository.getBlogById(command.blogId);
    console.log('blog', blog);
    if (!blog) return false;
    return new BlogInformation(
      blog.id.toString(),
      blog.name,
      blog.description,
      blog.websiteUrl,
      blog.createdAt,
      blog.isMembership,
    );
  }
}
