import { CreateUserInputModel } from '../../api/users-models';
import { UserInformation } from '../users-output';
import * as bcrypt from 'bcrypt';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../../../entities/user-entity';
import { UsersRepo } from '../../infrastructure/users-repo';
import { add } from 'date-fns';

export class CreateUserCommand {
  constructor(public dto: CreateUserInputModel) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(private readonly usersRepo: UsersRepo) {}

  async execute(command: CreateUserCommand) {
    //check input information on exists
    const checkLoginExist = await this.usersRepo.checkLogin(command.dto.login);
    if (checkLoginExist) throw new BadRequestException('login');

    const checkEmailExist = await this.usersRepo.checkEmail(command.dto.email);
    if (checkEmailExist) throw new BadRequestException('email');

    //create user
    const user = new User();
    user.login = command.dto.login;
    user.email = command.dto.email;
    user.passwordSalt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(
      command.dto.password,
      user.passwordSalt,
    );
    user.createdAt = new Date();
    user.confirmationCode = uuidv4();
    user.expirationDate = add(new Date(), { hours: 1 });
    await this.usersRepo.saveUser(user);

    //return new User
    return new UserInformation(
      user.id,
      command.dto.login,
      command.dto.email,
      user.createdAt,
    );
  }
}
