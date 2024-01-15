import { BlogsRepository } from '../../infrastructure/blogs-repository';
import { LikesPostService } from '../../../likes/likes-post-service';
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
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly likesPostService: LikesPostService,
  ) {}

  async execute(command: GetPostsToBlogCommand) {
    const blog = await this.blogsRepository.getBlogById(command.blogId);
    if (!blog) return false;
    const allPosts = await this.blogsRepository.getPostByBlogId(
      command.query,
      command.blogId,
    );
    const countPost = await this.blogsRepository.countBlogsByBlogId(
      command.blogId,
    );
    const filterPostsByBlogId = await Promise.all(
      allPosts.map(
        async (p) =>
          new PostInformation(
            p.id.toString(),
            p.title,
            p.shortDescription,
            p.content,
            command.blogId,
            p.blogName,
            p.createdAt,
            p.extendedLikesInfo.countLike,
            p.extendedLikesInfo.countDislike,
            await this.likesPostService.getMyStatusToPost(
              p.id.toString(),
              command.userId,
            ),
            await this.likesPostService.getLikeListToPost(p.id.toString()),
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
