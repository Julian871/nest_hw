import { Injectable } from '@nestjs/common';
import { IsEnum } from 'class-validator';

enum LikeStatus {
  LIKE = 'Like',
  DISLIKE = 'Dislike',
  NONE = 'None',
}

@Injectable()
export class LikeStatusInputModel {
  @IsEnum(LikeStatus)
  likeStatus: string;
}
