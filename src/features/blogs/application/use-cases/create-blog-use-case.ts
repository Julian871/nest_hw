import { CreateBlogInputModel } from '../../api/blogs-dto-models';
import { BlogInformation } from '../blogs-output';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Blog } from '../../../../entities/blog-entity';
import { BlogsRepo } from '../../infrastructure/blogs-repo';

export class CreateBlogCommand {
  constructor(public data: CreateBlogInputModel) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(private readonly blogsRepo: BlogsRepo) {}

  async execute(command: CreateBlogCommand) {
    const blog = new Blog();
    blog.name = command.data.name;
    blog.description = command.data.description;
    blog.websiteUrl = command.data.websiteUrl;
    blog.createdAt = new Date();
    blog.isMembership = false;

    await this.blogsRepo.saveBlog(blog);

    return new BlogInformation(
      blog.id,
      command.data.name,
      command.data.description,
      command.data.websiteUrl,
      blog.createdAt,
      false,
    );
  }
}
