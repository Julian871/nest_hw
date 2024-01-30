import { UsersQuery } from '../../api/users-query';
import { UserInformation } from '../users-output';
import { PageInformation } from '../../../page-information';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersQueryRepo } from '../../infrastructure/users-query-repo';

export class GetUserCommand {
  constructor(public query: UsersQuery) {}
}

@CommandHandler(GetUserCommand)
export class GetUsersUseCase implements ICommandHandler<GetUserCommand> {
  constructor(private readonly usersQueryPero: UsersQueryRepo) {}

  async execute(command: GetUserCommand) {
    const usersCount = await this.usersQueryPero.getCountAllUsers(
      command.query,
    );
    const allUsers = await this.usersQueryPero.getAllUsers(command.query);
    const filterUsers = allUsers.map(
      (p) => new UserInformation(p.id, p.login, p.email, p.createdAt),
    );

    return new PageInformation(
      command.query.pageNumber,
      command.query.pageSize,
      usersCount,
      filterUsers,
    );
  }
}
