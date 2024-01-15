import { BlogsRepository } from '../../infrastructure/blogs-repository';
import { PostsRepository } from '../../../posts/infrastructure/posts-repository';
import { CreatePostForBlogInputModel } from '../../../posts/api/posts-models';
import { PostCreator } from '../../../posts/application/posts-input';
import { PostInformation } from '../../../posts/application/posts-output';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class CreatePostToBlogCommand {
  constructor(
    public blogId: string,
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

    const newPost = new PostCreator(
      command.dto.title,
      command.dto.shortDescription,
      command.dto.content,
      command.blogId,
      blog.name,
    );
    const post = await this.postsRepository.createNewPost(newPost);
    return new PostInformation(
      post[0].id,
      newPost.title,
      newPost.shortDescription,
      newPost.content,
      newPost.blogId,
      post[0].blogName,
      post[0].createdAt,
      0,
      0,
      'None',
      [],
    );
  }
}
