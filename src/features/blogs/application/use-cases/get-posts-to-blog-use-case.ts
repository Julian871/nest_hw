import { BlogsDefaultQuery } from '../../default-query';
import { PostInformation } from '../../../posts/application/posts-output';
import { PageInformation } from '../../../page-information';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { LikesPostService } from '../../../likes/application/likes-post-service';
import { BlogsRepo } from '../../infrastructure/blogs-repo';
import { PostsRepo } from '../../../posts/infrastructure/post-repo';
import { PostsQueryRepo } from '../../../posts/infrastructure/post-query-repo';

export class GetPostsToBlogCommand {
  constructor(
    public query: BlogsDefaultQuery,
    public blogId: number,
    public userId: number | null,
  ) {}
}

@CommandHandler(GetPostsToBlogCommand)
export class GetPostsToBlogUseCase
  implements ICommandHandler<GetPostsToBlogCommand>
{
  constructor(
    private readonly blogsRepo: BlogsRepo,
    private readonly postsRepo: PostsRepo,
    private readonly postsQueryRepo: PostsQueryRepo,
    private readonly likesPostService: LikesPostService,
  ) {}

  async execute(command: GetPostsToBlogCommand) {
    const blog = await this.blogsRepo.getBlogById(command.blogId);
    if (!blog) throw new NotFoundException();
    const allPosts = await this.postsQueryRepo.getPostToBlog(
      command.query,
      command.blogId,
    );
    const countPost = await this.postsRepo.getCountAllPostsByBlogId(
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
            +command.blogId,
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
      countPost,
      filterPostsByBlogId,
    );
  }
}
