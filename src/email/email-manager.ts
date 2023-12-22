/*
import { Injectable } from '@nestjs/common';
import { EmailAdapters } from './email-adapters';

@Injectable()
export class EmailManager {
  constructor(private readonly emailAdapters: EmailAdapters) {}
  async sendConfirmationLink(email: string, confirmationCode: string) {
    await this.emailAdapters.sendEmail(
      email,
      'registration-confirmation',
      `<h1>Thanks for your registration</h1>
 <p>To finish registration please follow the link below:
     <a href='https://somesite.com/confirm-email?code=${confirmationCode}'>complete registration</a>
 </p>`,
    );
  }

  async sendRecoveryCode(email: string, recoveryCode: string) {
    await this.emailAdapters.sendEmail(
      email,
      'password-recovery',
      `<h1>Password recovery</h1>
 <p>To finish password recovery please follow the link below:
     <a href='https://somesite.com/password-recovery?recoveryCode=${recoveryCode}'>recovery password</a>
 </p>`,
    );
  }
}
*/
