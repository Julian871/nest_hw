import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { UsersRepo } from '../../infrastructure/users-repo';

export class DeleteUserCommand {
  constructor(public userId: number) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(private readonly usersRepo: UsersRepo) {}

  async execute(command: DeleteUserCommand) {
    const isDelete = await this.usersRepo.deleteUserById(command.userId);
    if (!isDelete) throw new NotFoundException();
  }
}
