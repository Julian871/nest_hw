import { PostsRepository } from '../../infrastructure/posts-repository';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs-repository';
import { CreatePostInputModel } from '../../api/posts-models';
import { PostInformation } from '../posts-output';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';

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
    const blogName = await this.blogsRepository.getBlogById(
      +command.dto.blogId,
    );
    if (!blogName) throw new NotFoundException();

    const post = await this.postsRepository.createNewPost(
      command.dto.title,
      command.dto.shortDescription,
      +command.dto.blogId,
      blogName,
      command.dto.content,
    );

    return new PostInformation(
      post.id,
      command.dto.title,
      command.dto.shortDescription,
      command.dto.content,
      +command.dto.blogId,
      blogName,
      post.createdAt,
      0,
      0,
      'None',
      [],
    );
  }
}
