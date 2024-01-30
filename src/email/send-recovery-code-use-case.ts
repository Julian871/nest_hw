import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MailerService } from '@nestjs-modules/mailer';
import { v4 as uuidv4 } from 'uuid';
import { UsersRepo } from '../features/users/infrastructure/users-repo';

export class SendRecoveryCodeCommand {
  constructor(public email: string) {}
}

@CommandHandler(SendRecoveryCodeCommand)
export class SendRecoveryCodeUseCase
  implements ICommandHandler<SendRecoveryCodeCommand>
{
  constructor(
    private readonly mailerService: MailerService,
    private readonly usersRepo: UsersRepo,
  ) {}

  async execute(command: SendRecoveryCodeCommand) {
    const newRecoveryCode = uuidv4();

    await this.mailerService.sendMail({
      to: command.email, // list of receivers
      from: process.env.EMAIL, // sender address
      subject: 'Send recovery code', // Subject line
      text: 'recovery code', // plaintext body
      html: `<h1>Thanks for your registration</h1>
 <p>To finish registration please follow the link below:
     <a href='https://somesite.com/confirm-email?code=${newRecoveryCode}'>complete registration</a>
 </p>`,
    });
    const user = await this.usersRepo.checkEmail(command.email);
    user!.recoveryCode = newRecoveryCode;
    await this.usersRepo.saveUser(user!);
  }
}
