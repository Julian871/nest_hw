import { BlogsQuery } from '../../blogs-query';
import { BlogInformation } from '../blogs-output';
import { PageInformation } from '../../../page-information';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsQueryRepo } from '../../infrastructure/blogs-query-repo';

export class GetBlogsCommand {
  constructor(public query: BlogsQuery) {}
}

@CommandHandler(GetBlogsCommand)
export class GetBlogsUseCase implements ICommandHandler<GetBlogsCommand> {
  constructor(private readonly blogsQueryRepo: BlogsQueryRepo) {}

  async execute(command: GetBlogsCommand) {
    const blogsCount = await this.blogsQueryRepo.getCountAllBlogs(
      command.query,
    );
    const allBlogs = await this.blogsQueryRepo.getAllBlogs(command.query);
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
