import { Injectable } from '@nestjs/common';
import { Length } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

@Injectable()
export class CreateCommentInputModel {
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(20, 300)
  content: string;
}
