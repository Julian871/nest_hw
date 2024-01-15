import { Injectable } from '@nestjs/common';
import { IsNotEmpty, MaxLength } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';
import { isBlogExist } from '../application/blogId.exist';

@Injectable()
export class CreatePostForBlogInputModel {
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsNotEmpty()
  @MaxLength(30)
  title: string;

  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MaxLength(100)
  shortDescription: string;

  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MaxLength(1000)
  content: string;
}

@Injectable()
export class CreatePostInputModel {
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MaxLength(30)
  title: string;

  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MaxLength(100)
  shortDescription: string;

  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MaxLength(1000)
  content: string;

  @isBlogExist()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  blogId: string;
}

@Injectable()
export class UpdatePostInputModel {
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MaxLength(30)
  title: string;

  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MaxLength(100)
  shortDescription: string;

  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MaxLength(1000)
  content: string;
}
