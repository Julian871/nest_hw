import { UsersRepository } from '../../infrastructure/users-repository';
import { UsersQuery } from '../../users-query';
import { UserInformation } from '../users-output';
import { PageInformation } from '../../../page-information';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class GetUserCommand {
  constructor(public query: UsersQuery) {}
}

@CommandHandler(GetUserCommand)
export class GetUsersUseCase implements ICommandHandler<GetUserCommand> {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: GetUserCommand) {
    const usersCount = await this.usersRepository.usersCount(command.query);
    const allUsers = await this.usersRepository.getAllUsers(command.query);
    const filterUsers = allUsers.map(
      (p) =>
        new UserInformation(p.id.toString(), p.login, p.email, p.createdAt),
    );
    return new PageInformation(
      command.query.pageNumber,
      command.query.pageSize,
      usersCount,
      filterUsers,
    );
  }
}
