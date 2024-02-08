import { CommentInformation } from '../../../comments/application/comments-output';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthService } from '../../../../security/auth-service';
import { NotFoundException } from '@nestjs/common';
import { UsersRepo } from '../../../users/infrastructure/users-repo';
import { PostsRepo } from '../../infrastructure/post-repo';
import { Comment } from '../../../../entities/comment-entity';
import { CommentsRepo } from '../../../comments/infrastructure/comments-repo';

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
    private readonly postsRepo: PostsRepo,
    private readonly usersRepo: UsersRepo,
    private readonly commentsRepo: CommentsRepo,
    private readonly authService: AuthService,
  ) {}

  async execute(command: CreatePostCommentCommand) {
    const userId = await this.authService.getUserIdFromAccessToken(
      command.accessToken,
    );
    if (userId === null) throw new NotFoundException();
    const post = await this.postsRepo.getPostById(command.postId);
    if (!post) throw new NotFoundException();

    const user = await this.usersRepo.checkUser(userId);

    const comment = new Comment();
    comment.post = post;
    comment.content = command.content;
    comment.createdAt = new Date();
    comment.owner = user!;
    await this.commentsRepo.saveComment(comment);

    return new CommentInformation(
      comment.id,
      command.content,
      userId,
      user!.login,
      comment.createdAt,
      0,
      0,
      'None',
    );
  }
}
