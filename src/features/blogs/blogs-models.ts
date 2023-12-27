import { Injectable } from '@nestjs/common';
import { IsNotEmpty, IsUrl, MaxLength } from 'class-validator';

@Injectable()
export class CreateBlogInputModel {
  @IsNotEmpty()
  @MaxLength(15)
  name: string;

  @IsNotEmpty()
  @MaxLength(500)
  description: string;

  @IsNotEmpty()
  @MaxLength(100)
  @IsUrl()
  websiteUrl: string;
}
