import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepo } from '../../infrastructure/comments-repo';
import { NotFoundException } from '@nestjs/common';

export class UpdateCommentCommand {
  constructor(
    public commentId: number,
    public content: string,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase
  implements ICommandHandler<UpdateCommentCommand>
{
  constructor(private readonly commentsRepo: CommentsRepo) {}

  async execute(command: UpdateCommentCommand) {
    const comment = await this.commentsRepo.getCommentById(command.commentId);
    if (!comment) throw new NotFoundException();

    // update comment
    comment.content = command.content;
    await this.commentsRepo.saveComment(comment);
  }
}
