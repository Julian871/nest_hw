import { Injectable } from '@nestjs/common';
import { Length } from 'class-validator';

@Injectable()
export class CreateCommentInputModel {
  @Length(20, 300)
  content: string;
}
