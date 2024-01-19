import { PostsRepository } from '../../infrastructure/posts-repository';
import { UsersRepository } from '../../../users/infrastructure/users-repository';
import { CommentInformation } from '../../../comments/application/comments-output';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthService } from '../../../../security/auth-service';
import { NotFoundException } from '@nestjs/common';
import { CommentsRepository } from '../../../comments/infrastructure/comments-repository';
export class CreatePostCommentCommand {
  constructor(
    public postId: number,
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
    private readonly commentsRepository: CommentsRepository,
    private readonly authService: AuthService,
  ) {}

  async execute(command: CreatePostCommentCommand) {
    const userId = await this.authService.getUserIdFromAccessToken(
      command.accessToken,
    );
    if (userId === null) throw new NotFoundException();
    const checkPost = await this.postsRepository.getPostById(command.postId);
    if (!checkPost) throw new NotFoundException();

    const user = await this.usersRepository.getUserById(userId);

    const comment = await this.commentsRepository.createNewPostComment(
      command.postId,
      command.content,
      userId,
      user[0].login,
    );
    return new CommentInformation(
      comment.id,
      command.content,
      userId,
      user[0].login,
      comment.createdAt,
      0,
      0,
      'None',
    );
  }
}
