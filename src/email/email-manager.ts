import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailManager {
  constructor(private readonly mailerService: MailerService) {}
  async sendConfirmationLink(email: string, confirmationCode: string) {
    await this.mailerService.sendMail({
      to: email, // list of receivers
      from: process.env.EMAIL, // sender address
      subject: 'Send confirmation code', // Subject line
      text: 'confirmation code', // plaintext body
      html: `<h1>Thanks for your registration</h1>
 <p>To finish registration please follow the link below:
     <a href='https://somesite.com/confirm-email?code=${confirmationCode}'>complete registration</a>
 </p>`,
    });
  }

  async sendRecoveryCode(email: string, recoveryCode: string) {
    await this.mailerService.sendMail({
      to: email, // list of receivers
      from: process.env.EMAIL, // sender address
      subject: 'Send recovery code', // Subject line
      text: 'recovery code', // plaintext body
      html: `<h1>Thanks for your registration</h1>
 <p>To finish registration please follow the link below:
     <a href='https://somesite.com/confirm-email?code=${recoveryCode}'>complete registration</a>
 </p>`,
    });
  }
}
