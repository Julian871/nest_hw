import { PostInformation } from '../posts-output';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { LikesPostService } from '../../../likes/application/likes-post-service';
import { PostsRepo } from '../../infrastructure/post-repo';

export class GetPostByIdCommand {
  constructor(
    public postId: number,
    public userId: number | null,
  ) {}
}

@CommandHandler(GetPostByIdCommand)
export class GetPostByIdUseCase implements ICommandHandler<GetPostByIdCommand> {
  constructor(
    private readonly postsRepo: PostsRepo,
    private readonly likesPostService: LikesPostService,
  ) {}

  async execute(command: GetPostByIdCommand) {
    const post = await this.postsRepo.getPostById(command.postId);
    if (!post) throw new NotFoundException();

    return new PostInformation(
      command.postId,
      post.title,
      post.shortDescription,
      post.content,
      post.blog.id,
      post.blog.name,
      post.createdAt,
      await this.likesPostService.getLikeCount(command.postId),
      await this.likesPostService.getDislikeCount(command.postId),
      await this.likesPostService.getMyStatusToPost(
        command.postId,
        command.userId,
      ),
      await this.likesPostService.getLikeListToPost(command.postId),
    );
  }
}
