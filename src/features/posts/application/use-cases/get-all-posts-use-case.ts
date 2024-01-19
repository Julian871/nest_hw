import { PostsRepository } from '../../infrastructure/posts-repository';
import { PostsDefaultQuery } from '../../default-query';
import { PostInformation } from '../posts-output';
import { PageInformation } from '../../../page-information';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikesPostService } from '../../../likes/likes-post-service';

export class GetAllPostsCommand {
  constructor(
    public query: PostsDefaultQuery,
    public userId: number | null,
  ) {}
}

@CommandHandler(GetAllPostsCommand)
export class GetAllPostsUseCase implements ICommandHandler<GetAllPostsCommand> {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly likesPostService: LikesPostService,
  ) {}

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
            await this.likesPostService.getLikeCount(p.id),
            await this.likesPostService.getDislikeCount(p.id),
            await this.likesPostService.getMyStatusToPost(p.id, command.userId),
            await this.likesPostService.getLikeListToPost(p.id),
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
