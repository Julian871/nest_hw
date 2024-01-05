import { UsersRepository } from '../../infrastructure/users-repository';
import { SessionRepository } from '../../../devices/session/session-repository';
import { EmailManager } from '../../../../email/email-manager';
import { CreateUserInputModel } from '../../users-models';
import { UserInformation } from '../users-output';
import * as bcrypt from 'bcrypt';
import { UserCreator } from '../users-input';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class CreateUserCommand {
  constructor(public dto: CreateUserInputModel) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly emailManager: EmailManager,
  ) {}

  async execute(command: CreateUserCommand) {
    //check input information on exists
    const checkInputInfo = await this.usersRepository.checkLoginAndEmail(
      command.dto.login,
      command.dto.email,
    );
    if (checkInputInfo) return false;

    //create user
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(command.dto.password, passwordSalt);
    const newUser = new UserCreator(
      command.dto.login,
      command.dto.email,
      passwordHash,
      passwordSalt,
    );
    const user = await this.usersRepository.createNewUser(newUser);

    // send confirmation link with a code on email
    await this.emailManager.sendConfirmationLink(
      command.dto.email,
      newUser.emailConfirmation.confirmationCode,
    );

    // return new user
    return new UserInformation(
      user._id.toString(),
      command.dto.login,
      command.dto.email,
      user.accountData.createdAt,
    );
  }
}
