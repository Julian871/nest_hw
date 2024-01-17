import { UsersRepository } from '../../infrastructure/users-repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';

export class DeleteUserCommand {
  constructor(public userId: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: DeleteUserCommand) {
    const isDelete = await this.usersRepository.deleteUserById(command.userId);
    if (!isDelete) throw new NotFoundException();
  }
}
