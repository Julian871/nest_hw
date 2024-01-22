import { BlogsRepository } from '../../infrastructure/blogs-repository';
import { PostsRepository } from '../../../posts/infrastructure/posts-repository';
import { CreatePostForBlogInputModel } from '../../../posts/api/posts-models';
import { PostInformation } from '../../../posts/application/posts-output';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

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
    private readonly blogsRepository: BlogsRepository,
    private readonly postsRepository: PostsRepository,
  ) {}

  async execute(command: CreatePostToBlogCommand) {
    const blog = await this.blogsRepository.getBlogById(command.blogId);
    if (!blog) return false;

    const post = await this.postsRepository.createNewPost(
      command.dto.title,
      command.dto.shortDescription,
      +command.blogId,
      blog.name,
      command.dto.content,
    );
    return new PostInformation(
      post[0].id,
      command.dto.title,
      command.dto.shortDescription,
      command.dto.content,
      +command.blogId,
      blog.name,
      post[0].createdAt,
      0,
      0,
      'None',
      [],
    );
  }
}
