import { UsersRepository } from '../../infrastructure/users-repository';
import { CommandHandler } from '@nestjs/cqrs';

export class DeleteUserCommand {
  constructor(public userId: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: DeleteUserCommand) {
    return await this.usersRepository.deleteUserById(command.userId);
  }
}
