import { Injectable } from '@nestjs/common';
import { IsEmail, IsString, Length } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

@Injectable()
export class EmailInputModel {
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsEmail()
  email: string;
}

@Injectable()
export class NewPasswordInputModel {
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  @Length(6, 20)
  newPassword: string;

  @IsString()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  recoveryCode: string;
}

@Injectable()
export class LogInInputModel {
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  loginOrEmail: string;

  @IsString()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  password: string;
}

@Injectable()
export class CodeInputModel {
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  code: string;
}
