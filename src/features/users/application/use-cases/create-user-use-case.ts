import { UsersRepository } from '../../infrastructure/users-repository';
import { CreateUserInputModel } from '../../api/users-models';
import { UserInformation } from '../users-output';
import * as bcrypt from 'bcrypt';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserCreatorToSql } from '../../../auth/users-input';

export class CreateUserCommand {
  constructor(public dto: CreateUserInputModel) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: CreateUserCommand) {
    //check input information on exists
    const checkInputInfo = await this.usersRepository.checkExistUser(
      command.dto.login,
      command.dto.email,
    );
    if (checkInputInfo.length !== 0) return false;

    //create user
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(command.dto.password, passwordSalt);
    const newUser = new UserCreatorToSql(
      command.dto.login,
      command.dto.email,
      passwordHash,
      passwordSalt,
    );
    const user = await this.usersRepository.registrationNewUser(newUser);

    //return new user
    return new UserInformation(
      user[0].id.toString(),
      command.dto.login,
      command.dto.email,
      user[0].createdAt,
    );
  }
}
