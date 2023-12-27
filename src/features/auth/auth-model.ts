import { Injectable } from '@nestjs/common';
import { IsEmail, IsString, Length } from 'class-validator';

@Injectable()
export class EmailInputModel {
  @IsEmail()
  email: string;
}

@Injectable()
export class NewPasswordInputModel {
  @IsString()
  @Length(6, 20)
  newPassword: string;

  @IsString()
  recoveryCode: string;
}

@Injectable()
export class LogInInputModel {
  @IsString()
  loginOrEmail: string;

  @IsString()
  password: string;
}

@Injectable()
export class CodeInputModel {
  @IsString()
  code: string;
}
