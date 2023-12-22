import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type postDocument = HydratedDocument<Post>;

@Schema()
export class ExtendedLikesInfo {
  @Prop({ default: 0 })
  countLike: number;

  @Prop({ default: 0 })
  countDislike: number;

  @Prop({ default: [] })
  likeList: [];

  @Prop({ default: [] })
  dislikeList: [];
}

export const ExtendedLikesInfoSchema =
  SchemaFactory.createForClass(ExtendedLikesInfo);

@Schema()
export class Post {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  shortDescription: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  blogId: string;

  @Prop({ required: true })
  blogName: string;

  @Prop({ required: true })
  createdAt: string;

  @Prop({ type: ExtendedLikesInfoSchema, default: new ExtendedLikesInfo() })
  extendedLikesInfo: ExtendedLikesInfo;
}

export const PostSchema = SchemaFactory.createForClass(Post);
