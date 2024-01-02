import { CommentsRepository } from '../../infrastructure/comments-repository';
import { LikesCommentsService } from '../../../likes/likes-comment-service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class GetCommentCommand {
  constructor(
    public commentId: string,
    public userId: string | null,
  ) {}
}

@CommandHandler(GetCommentCommand)
export class GetCommentUseCase implements ICommandHandler<GetCommentCommand> {
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly likesCommentService: LikesCommentsService,
  ) {}

  async execute(command: GetCommentCommand) {
    const commentInfo = await this.commentsRepository.getCommentById(
      command.commentId,
    );
    if (!commentInfo) return false;

    return {
      id: commentInfo._id.toString(),
      content: commentInfo.content,
      commentatorInfo: {
        userId: commentInfo.commentatorInfo.userId,
        userLogin: commentInfo.commentatorInfo.userLogin,
      },
      createdAt: commentInfo.createdAt,
      likesInfo: {
        likesCount: commentInfo.likesInfo.countLike,
        dislikesCount: commentInfo.likesInfo.countDislike,
        myStatus: await this.likesCommentService.getMyStatus(
          commentInfo._id.toString(),
          command.userId,
        ),
      },
    };
  }
}
