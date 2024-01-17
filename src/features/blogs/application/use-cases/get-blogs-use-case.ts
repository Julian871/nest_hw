import { BlogsRepository } from '../../infrastructure/blogs-repository';
import { BlogsQuery } from '../../blogs-query';
import { BlogInformation } from '../blogs-output';
import { PageInformation } from '../../../page-information';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class GetBlogsCommand {
  constructor(public query: BlogsQuery) {}
}

@CommandHandler(GetBlogsCommand)
export class GetBlogsUseCase implements ICommandHandler<GetBlogsCommand> {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(command: GetBlogsCommand) {
    const blogsCount = await this.blogsRepository.countBlogsByName(
      command.query,
    );
    const allBlogs = await this.blogsRepository.getAllBlogs(command.query);
    const filterBlogs = allBlogs.map(
      (p) =>
        new BlogInformation(
          p.id,
          p.name,
          p.description,
          p.websiteUrl,
          p.createdAt,
          p.isMembership,
        ),
    );
    return new PageInformation(
      command.query.pageNumber,
      command.query.pageSize,
      blogsCount,
      filterBlogs,
    );
  }
}
