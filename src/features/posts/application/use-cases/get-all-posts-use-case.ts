import { PostsRepository } from '../../infrastructure/posts-repository';
import { LikesPostService } from '../../../likes/likes-post-service';
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
            p._id.toString(),
            p.title,
            p.shortDescription,
            p.content,
            p.blogId,
            p.blogName,
            p.createdAt,
            p.extendedLikesInfo.countLike,
            p.extendedLikesInfo.countDislike,
            await this.likesPostService.getMyStatusToPost(
              p._id.toString(),
              command.userId,
            ),
            await this.likesPostService.getLikeListToPost(p._id.toString()),
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
