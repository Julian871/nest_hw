import { Injectable } from '@nestjs/common';
import { IsNotEmpty, MaxLength } from 'class-validator';

@Injectable()
export class CreatePostForBlogInputModel {
  @IsNotEmpty()
  @MaxLength(30)
  title: string;

  @IsNotEmpty()
  @MaxLength(100)
  shortDescription: string;

  @IsNotEmpty()
  @MaxLength(1000)
  content: string;
}

@Injectable()
export class CreatePostInputModel {
  @IsNotEmpty()
  @MaxLength(30)
  title: string;

  @IsNotEmpty()
  @MaxLength(100)
  shortDescription: string;

  @IsNotEmpty()
  @MaxLength(1000)
  content: string;

  @IsNotEmpty()
  blogId: string;
}
