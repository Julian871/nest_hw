import { PostsRepository } from '../../infrastructure/posts-repository';
import { LikesPostService } from '../../../likes/likes-post-service';
import { PostInformation } from '../posts-output';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class GetPostByIdCommand {
  constructor(
    public postId: string,
    public userId: string | null,
  ) {}
}

@CommandHandler(GetPostByIdCommand)
export class GetPostByIdUseCase implements ICommandHandler<GetPostByIdCommand> {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly likesPostService: LikesPostService,
  ) {}

  async execute(command: GetPostByIdCommand) {
    const post = await this.postsRepository.getPostById(command.postId);
    if (!post) {
      return false;
    }
    return new PostInformation(
      command.postId,
      post.title,
      post.shortDescription,
      post.content,
      post.blogId,
      post.blogName,
      post.createdAt,
      post.extendedLikesInfo.countLike,
      post.extendedLikesInfo.countDislike,
      await this.likesPostService.getMyStatusToPost(
        command.postId,
        command.userId,
      ),
      await this.likesPostService.getLikeListToPost(command.postId),
    );
  }
}
