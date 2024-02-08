import { CreatePostInputModel } from '../../api/posts-models';
import { PostInformation } from '../posts-output';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { BlogsRepo } from '../../../blogs/infrastructure/blogs-repo';
import { Post } from '../../../../entities/post-entity';
import { PostsRepo } from '../../infrastructure/post-repo';

export class CreatePostCommand {
  constructor(public dto: CreatePostInputModel) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    private readonly postsRepo: PostsRepo,
    private readonly blogsRepo: BlogsRepo,
  ) {}

  async execute(command: CreatePostCommand) {
    const blog = await this.blogsRepo.getBlogById(+command.dto.blogId);
    if (!blog) throw new NotFoundException();

    const post = new Post();
    post.title = command.dto.title;
    post.shortDescription = command.dto.shortDescription;
    post.content = command.dto.content;
    post.blog = blog;
    post.createdAt = new Date();

    await this.postsRepo.savePost(post);

    return new PostInformation(
      post.id,
      command.dto.title,
      command.dto.shortDescription,
      command.dto.content,
      +command.dto.blogId,
      blog.name,
      post.createdAt,
      0,
      0,
      'None',
      [],
    );
  }
}
