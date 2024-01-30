import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepo } from '../../users/infrastructure/users-repo';
import { BadRequestException } from '@nestjs/common';
import { SendConfirmationCodeCommand } from '../../../email/send-caonfirmation-code-use-case';
import { v4 as uuidv4 } from 'uuid';
import { SessionRepo } from '../../devices/infrastructure/session-repo';

export class RegistrationEmailResendingCommand {
  constructor(
    public email: string,
    public deviceId: string,
    public tokenLastActiveDate: string,
  ) {}
}

@CommandHandler(RegistrationEmailResendingCommand)
export class RegistrationEmailResendingUseCase
  implements ICommandHandler<RegistrationEmailResendingCommand>
{
  constructor(
    private readonly usersRepo: UsersRepo,
    private readonly sessionRepo: SessionRepo,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: RegistrationEmailResendingCommand) {
    const user = await this.usersRepo.checkEmail(command.email);
    const newConfirmationCode = uuidv4();
    if (!user) {
      throw new BadRequestException('email');
    } else if (!user.isConfirmation) {
      const session = await this.sessionRepo.getSessionByDeviceId(
        command.deviceId,
      );
      session!.userId = user.id;
      session!.lastActiveDate = command.tokenLastActiveDate;
      await this.sessionRepo.saveSession(session!);

      await this.commandBus.execute(
        new SendConfirmationCodeCommand(command.email, newConfirmationCode),
      );

      // update confirmation code
      user.confirmationCode = newConfirmationCode;
      await this.usersRepo.saveUser(user);
      return true;
    } else {
      throw new BadRequestException('email');
    }
  }
}
