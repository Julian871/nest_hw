import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type blackListDocument = HydratedDocument<BlackList>;

@Schema()
export class BlackList {
  @Prop({ required: true })
  token: string;
}

export const BlackListSchema = SchemaFactory.createForClass(BlackList);
