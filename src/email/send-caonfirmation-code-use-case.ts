import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MailerService } from '@nestjs-modules/mailer';

export class SendConfirmationCodeCommand {
  constructor(
    public email: string,
    public confirmationCode: string,
  ) {}
}

@CommandHandler(SendConfirmationCodeCommand)
export class SendConfirmationCodeUseCase
  implements ICommandHandler<SendConfirmationCodeCommand>
{
  constructor(private readonly mailerService: MailerService) {}

  async execute(command: SendConfirmationCodeCommand) {
    await this.mailerService.sendMail({
      to: command.email, // list of receivers
      from: process.env.EMAIL, // sender address
      subject: 'Send confirmation code', // Subject line
      text: 'confirmation code', // plaintext body
      html: `<h1>Thanks for your registration</h1>
 <p>To finish registration please follow the link below:
     <a href='https://somesite.com/confirm-email?code=${command.confirmationCode}'>complete registration</a>
 </p>`,
    });
  }
}
