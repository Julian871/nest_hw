import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type commentDocument = HydratedDocument<Comment>;

@Schema()
export class LikesInfo {
  @Prop({ default: 0 })
  countLike: number;

  @Prop({ default: 0 })
  countDislike: number;

  @Prop({ default: [] })
  likeList: [];

  @Prop({ default: [] })
  dislikeList: [];
}

export const LikesInfoSchema = SchemaFactory.createForClass(LikesInfo);

@Schema()
export class CommentatorInfo {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  userLogin: string;
}

export const CommentatorInfoSchema =
  SchemaFactory.createForClass(CommentatorInfo);

@Schema()
export class Comment {
  @Prop({ required: true })
  content: string;

  @Prop({ type: CommentatorInfoSchema, default: new CommentatorInfo() })
  commentatorInfo: CommentatorInfo;

  @Prop({ default: new Date().toISOString() })
  createdAt: string;

  @Prop({ required: true })
  idPost: string;

  @Prop({ type: LikesInfoSchema, default: new LikesInfo() })
  likesInfo: LikesInfo;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
