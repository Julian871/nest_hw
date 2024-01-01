import { PostsRepository } from '../../infrastructure/posts-repository';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs-repository';
import { CreatePostInputModel } from '../../posts-models';
import { PostCreator } from '../posts-input';
import { PostInformation } from '../posts-output';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class CreatePostCommand {
  constructor(public dto: CreatePostInputModel) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async execute(command: CreatePostCommand) {
    const blog = await this.blogsRepository.getBlogById(command.dto.blogId);
    const newPost = new PostCreator(
      command.dto.title,
      command.dto.shortDescription,
      command.dto.content,
      command.dto.blogId,
      blog!.name,
    );
    const post = await this.postsRepository.createNewPost(newPost);

    return new PostInformation(
      post._id.toString(),
      newPost.title,
      newPost.shortDescription,
      newPost.content,
      newPost.blogId,
      post.blogName,
      post.createdAt,
      0,
      0,
      'None',
      [],
    );
  }
}
