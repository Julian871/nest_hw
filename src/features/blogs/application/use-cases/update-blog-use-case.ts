import { UpdateBlogInputModel } from '../../api/blogs-dto-models';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { BlogsRepo } from '../../infrastructure/blogs-repo';

export class UpdateBlogCommand {
  constructor(
    public blogId: number,
    public dto: UpdateBlogInputModel,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(private readonly blogsRepo: BlogsRepo) {}

  async execute(command: UpdateBlogCommand) {
    const blog = await this.blogsRepo.getBlogById(command.blogId);
    if (!blog) throw new NotFoundException();
    blog.name = command.dto.name;
    blog.description = command.dto.description;
    blog.websiteUrl = command.dto.websiteUrl;
    await this.blogsRepo.saveBlog(blog);
    return;
  }
}
