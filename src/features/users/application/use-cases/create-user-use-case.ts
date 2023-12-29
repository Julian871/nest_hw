import { UsersRepository } from '../../infrastructure/users-repository';
import { ConnectRepository } from '../../../connect/connect-repository';
import { EmailManager } from '../../../../email/email-manager';
import { CreateUserInputModel } from '../../users-models';
import { UserInformation } from '../users-output';
import * as bcrypt from 'bcrypt';
import { UserCreator } from '../users-input';
import { CommandHandler } from '@nestjs/cqrs';

export class CreateUserCommand {
  constructor(
    public dto: CreateUserInputModel,
    public deviceId: string,
  ) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly connectRepository: ConnectRepository,
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

    // update session
    await this.connectRepository.updateUserId(user.id, command.deviceId);

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
