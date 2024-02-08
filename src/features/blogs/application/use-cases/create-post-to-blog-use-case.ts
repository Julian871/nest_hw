import { CreatePostForBlogInputModel } from '../../../posts/api/posts-models';
import { PostInformation } from '../../../posts/application/posts-output';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepo } from '../../infrastructure/blogs-repo';
import { PostsRepo } from '../../../posts/infrastructure/post-repo';
import { Post } from '../../../../entities/post-entity';

export class CreatePostToBlogCommand {
  constructor(
    public blogId: number,
    public dto: CreatePostForBlogInputModel,
  ) {}
}

@CommandHandler(CreatePostToBlogCommand)
export class CreatePostToBlogUseCase
  implements ICommandHandler<CreatePostToBlogCommand>
{
  constructor(
    private readonly blogsRepo: BlogsRepo,
    private readonly postsRepo: PostsRepo,
  ) {}

  async execute(command: CreatePostToBlogCommand) {
    const blog = await this.blogsRepo.getBlogById(command.blogId);
    if (!blog) return false;

    const post = new Post();
    post.title = command.dto.title;
    post.shortDescription = command.dto.shortDescription;
    post.content = command.dto.content;
    post.createdAt = new Date();
    post.blog = blog;

    await this.postsRepo.savePost(post);

    return new PostInformation(
      post.id,
      command.dto.title,
      command.dto.shortDescription,
      command.dto.content,
      +command.blogId,
      blog.name,
      post.createdAt,
      0,
      0,
      'None',
      [],
    );
  }
}
