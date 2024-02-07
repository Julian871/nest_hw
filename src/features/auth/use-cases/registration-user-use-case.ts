import * as bcrypt from 'bcrypt';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserInputModel } from '../../users/api/users-models';
import { BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../../entities/user-entity';
import { add } from 'date-fns';
import { UsersRepo } from '../../users/infrastructure/users-repo';
import { SendConfirmationCodeCommand } from '../../../email/send-caonfirmation-code-use-case';

export class RegistrationUserCommand {
  constructor(public dto: CreateUserInputModel) {}
}

@CommandHandler(RegistrationUserCommand)
export class RegistrationUserUseCase
  implements ICommandHandler<RegistrationUserCommand>
{
  constructor(
    private readonly usersRepo: UsersRepo,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: RegistrationUserCommand) {
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

    // send confirmation link with a code on email
    await this.commandBus.execute(
      new SendConfirmationCodeCommand(
        command.dto.email,
        user.confirmationCode!,
      ),
    );
    return true;
  }
}
