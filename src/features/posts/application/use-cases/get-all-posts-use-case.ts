import { PostsDefaultQuery } from '../../default-query';
import { PostInformation } from '../posts-output';
import { PageInformation } from '../../../page-information';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikesPostService } from '../../../likes/application/likes-post-service';
import { PostsRepo } from '../../infrastructure/post-repo';
import { PostsQueryRepo } from '../../infrastructure/post-query-repo';

export class GetAllPostsCommand {
  constructor(
    public query: PostsDefaultQuery,
    public userId: number | null,
  ) {}
}

@CommandHandler(GetAllPostsCommand)
export class GetAllPostsUseCase implements ICommandHandler<GetAllPostsCommand> {
  constructor(
    private readonly postsRepo: PostsRepo,
    private readonly postsQueryRepo: PostsQueryRepo,
    private readonly likesPostService: LikesPostService,
  ) {}

  async execute(command: GetAllPostsCommand) {
    const countPosts = await this.postsRepo.getCountAllPosts();
    const allPosts = await this.postsQueryRepo.getAllPosts(command.query);
    const filterPosts = await Promise.all(
      allPosts.map(
        async (p) =>
          new PostInformation(
            p.id,
            p.title,
            p.shortDescription,
            p.content,
            p.blog.id,
            p.blog.name,
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
