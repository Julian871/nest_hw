import { UsersRepository } from '../../infrastructure/users-repository';
import { CreateUserInputModel } from '../../api/users-models';
import { UserInformation } from '../users-output';
import * as bcrypt from 'bcrypt';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserCreatorToSql } from '../../../auth/users-input';
import { BadRequestException } from '@nestjs/common';

export class CreateUserCommand {
  constructor(public dto: CreateUserInputModel) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: CreateUserCommand) {
    //check input information on exists
    const checkLoginExist = await this.usersRepository.checkExistLogin(
      command.dto.login,
    );
    if (checkLoginExist) throw new BadRequestException('login');

    const checkEmailExist = await this.usersRepository.checkExistEmail(
      command.dto.email,
    );
    if (checkEmailExist) throw new BadRequestException('email');

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
