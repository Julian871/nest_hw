import { PostsRepository } from '../../infrastructure/posts-repository';
import { PostsDefaultQuery } from '../../default-query';
import { PostInformation } from '../posts-output';
import { PageInformation } from '../../../page-information';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class GetAllPostsCommand {
  constructor(
    public query: PostsDefaultQuery,
    public userId: string | null,
  ) {}
}

@CommandHandler(GetAllPostsCommand)
export class GetAllPostsUseCase implements ICommandHandler<GetAllPostsCommand> {
  constructor(private readonly postsRepository: PostsRepository) {}

  async execute(command: GetAllPostsCommand) {
    const countPosts = await this.postsRepository.countPosts();
    const allPosts = await this.postsRepository.getAllPosts(command.query);
    const filterPosts = await Promise.all(
      allPosts.map(
        async (p) =>
          new PostInformation(
            p.id,
            p.title,
            p.shortDescription,
            p.content,
            p.blogId,
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
      countPosts,
      filterPosts,
    );
  }
}
