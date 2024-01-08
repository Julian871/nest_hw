import { IsEmail, Length } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { Transform, TransformFnParams } from 'class-transformer';

@Injectable()
export class CreateUserInputModel {
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(3, 10)
  login: string;

  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(6, 20)
  password: string;

  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsEmail()
  email: string;
}
