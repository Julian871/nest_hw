import { Injectable } from '@nestjs/common';
import { IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

@Injectable()
export class CreateBlogInputModel {
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsNotEmpty()
  @MaxLength(15)
  name: string;

  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsNotEmpty()
  @MaxLength(500)
  description: string;

  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MaxLength(100)
  @IsUrl()
  websiteUrl: string;
}

@Injectable()
export class UpdateBlogInputModel {
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MaxLength(15)
  name: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MaxLength(500)
  description: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MaxLength(100)
  @IsUrl()
  websiteUrl: string;
}
