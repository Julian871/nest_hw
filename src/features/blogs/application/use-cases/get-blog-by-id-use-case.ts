import { BlogsRepository } from '../../infrastructure/blogs-repository';
import { BlogInformation } from '../blogs-output';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';

export class GetBlogByIdCommand {
  constructor(public blogId: number) {}
}

@CommandHandler(GetBlogByIdCommand)
export class GetBlogByIdUseCase implements ICommandHandler<GetBlogByIdCommand> {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(command: GetBlogByIdCommand) {
    const blog = await this.blogsRepository.getBlogById(command.blogId);
    if (!blog) throw new NotFoundException();
    return new BlogInformation(
      blog.id,
      blog.name,
      blog.description,
      blog.websiteUrl,
      blog.createdAt,
      blog.isMembership,
    );
  }
}
