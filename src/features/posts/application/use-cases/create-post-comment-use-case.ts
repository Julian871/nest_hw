import { PostsRepository } from '../../infrastructure/posts-repository';
import { UsersRepository } from '../../../users/infrastructure/users-repository';
import { CommentCreator } from '../../../comments/application/comments-input';
import { CommentInformation } from '../../../comments/application/comments-output';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
export class CreatePostCommentCommand {
  constructor(
    public postId: string,
    public content: string,
    public userId: string | null,
  ) {}
}

@CommandHandler(CreatePostCommentCommand)
export class CreatePostCommentUseCase
  implements ICommandHandler<CreatePostCommentCommand>
{
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(command: CreatePostCommentCommand) {
    if (command.userId === null) return false;
    const checkPost = await this.postsRepository.getPostById(command.postId);
    if (!checkPost) return false;
    const user = await this.usersRepository.getUserById(command.userId);
    const newComment = new CommentCreator(
      command.content,
      command.userId,
      user!.accountData.login,
      command.postId,
    );
    const comment = await this.postsRepository.createNewPostComment(newComment);
    return new CommentInformation(
      comment._id.toString(),
      command.content,
      command.userId,
      comment.commentatorInfo.userLogin,
      comment.createdAt.toString(),
      0,
      0,
      'None',
    );
  }
}
