import { CommentsRepository } from '../../infrastructure/comments-repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

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
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async execute(command: UpdateCommentCommand) {
    await this.commentsRepository.updateCommentById(
      command.commentId,
      command.content,
    );
  }
}
