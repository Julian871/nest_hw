import * as bcrypt from 'bcrypt';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserInputModel } from '../users/api/users-models';
import { UsersRepository } from '../users/infrastructure/users-repository';
import { EmailManager } from '../../email/email-manager';
import { UserCreatorToSql } from './users-input';

export class RegistrationUserCommand {
  constructor(public dto: CreateUserInputModel) {}
}

@CommandHandler(RegistrationUserCommand)
export class RegistrationUserUseCase
  implements ICommandHandler<RegistrationUserCommand>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly emailManager: EmailManager,
  ) {}

  async execute(command: RegistrationUserCommand) {
    //check input information on exists
    const checkInputInfo = await this.usersRepository.checkExistUser(
      command.dto.login,
      command.dto.email,
    );
    if (checkInputInfo.length !== 0) {
      if (checkInputInfo[0].login === command.dto.login) {
        return 'login';
      } else {
        return 'email';
      }
    }

    //create user
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(command.dto.password, passwordSalt);
    const newUser = new UserCreatorToSql(
      command.dto.login,
      command.dto.email,
      passwordHash,
      passwordSalt,
    );
    await this.usersRepository.registrationNewUser(newUser);

    // send confirmation link with a code on email
    await this.emailManager.sendConfirmationLink(
      command.dto.email,
      newUser.confirmationCode,
    );
    return true;
  }
}
