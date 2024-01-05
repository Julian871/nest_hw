import { PostsRepository } from '../../infrastructure/posts-repository';
import { UsersRepository } from '../../../users/infrastructure/users-repository';
import { CommentCreator } from '../../../comments/application/comments-input';
import { CommentInformation } from '../../../comments/application/comments-output';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthService } from '../../../../security/auth-service';
export class CreatePostCommentCommand {
  constructor(
    public postId: string,
    public content: string,
    public accessToken: string,
  ) {}
}

@CommandHandler(CreatePostCommentCommand)
export class CreatePostCommentUseCase
  implements ICommandHandler<CreatePostCommentCommand>
{
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly authService: AuthService,
  ) {}

  async execute(command: CreatePostCommentCommand) {
    const userId = await this.authService.getUserIdFromAccessToken(
      command.accessToken,
    );
    if (userId === null) return false;
    const checkPost = await this.postsRepository.getPostById(command.postId);
    if (!checkPost) return false;
    const user = await this.usersRepository.getUserById(userId);
    const newComment = new CommentCreator(
      command.content,
      userId,
      user!.accountData.login,
      command.postId,
    );
    const comment = await this.postsRepository.createNewPostComment(newComment);
    return new CommentInformation(
      comment._id.toString(),
      command.content,
      userId,
      comment.commentatorInfo.userLogin,
      comment.createdAt.toString(),
      0,
      0,
      'None',
    );
  }
}
