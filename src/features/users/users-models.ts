import { IsEmail, Length } from 'class-validator';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CreateUserInputModel {
  @Length(3, 10)
  login: string;

  @Length(6, 20)
  password: string;

  @IsEmail()
  email: string;
}
