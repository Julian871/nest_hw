/*
import nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailAdapters {
  constructor() {}
  async sendEmail(email: string, subject: string, message: string) {
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transport.sendMail({
      from: 'Julian <julianmedvedev.rabota@gmail.com>',
      to: email,
      subject: subject,
      html: message,
    });
  }
}
*/
