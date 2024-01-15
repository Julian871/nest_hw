import { BlogsRepository } from '../../infrastructure/blogs-repository';
import { BlogsDefaultQuery } from '../../default-query';
import { PostInformation } from '../../../posts/application/posts-output';
import { PageInformation } from '../../../page-information';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class GetPostsToBlogCommand {
  constructor(
    public query: BlogsDefaultQuery,
    public blogId: string,
    public userId: string | null,
  ) {}
}

@CommandHandler(GetPostsToBlogCommand)
export class GetPostsToBlogUseCase
  implements ICommandHandler<GetPostsToBlogCommand>
{
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(command: GetPostsToBlogCommand) {
    const blog = await this.blogsRepository.getBlogById(command.blogId);
    if (!blog) return false;
    const allPosts = await this.blogsRepository.getPostByBlogId(
      command.query,
      command.blogId,
    );
    const countPost = await this.blogsRepository.countPostsByBlogId(
      command.blogId,
    );
    const filterPostsByBlogId = await Promise.all(
      allPosts.map(
        async (p) =>
          new PostInformation(
            p.id,
            p.title,
            p.shortDescription,
            p.content,
            command.blogId,
            p.blogName,
            p.createdAt,
            0,
            0,
            'None',
            [],
          ),
      ),
    );
    return new PageInformation(
      command.query.pageNumber,
      command.query.pageSize,
      countPost,
      filterPostsByBlogId,
    );
  }
}
