import { UpdatePostInputModel } from '../../api/posts-models';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepo } from '../../infrastructure/post-repo';
import { NotFoundException } from '@nestjs/common';

export class UpdatePostCommand {
  constructor(
    public postId: number,
    public blogId: number,
    public dto: UpdatePostInputModel,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(private readonly postsRepo: PostsRepo) {}

  async execute(command: UpdatePostCommand) {
    const post = await this.postsRepo.getPostByPostIdAndBlogId(
      command.postId,
      command.blogId,
    );
    if (!post) throw new NotFoundException();
    post.title = command.dto.title;
    post.content = command.dto.content;
    post.shortDescription = command.dto.shortDescription;
    await this.postsRepo.savePost(post);
    return;
  }
}
