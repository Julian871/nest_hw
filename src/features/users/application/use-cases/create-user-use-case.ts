import { UsersRepository } from '../../infrastructure/users-repository';
import { CreateUserInputModel } from '../../api/users-models';
import { UserInformation } from '../users-output';
import * as bcrypt from 'bcrypt';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

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
    const confirmationCode = uuidv4();

    const user = await this.usersRepository.registrationNewUser(
      passwordSalt,
      passwordHash,
      confirmationCode,
      command.dto.login,
      command.dto.email,
    );

    //return new User
    return new UserInformation(
      user[0].id,
      command.dto.login,
      command.dto.email,
      user[0].createdAt,
    );
  }
}
