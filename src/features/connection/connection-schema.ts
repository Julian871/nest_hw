import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type connectionDocument = HydratedDocument<Connection>;

@Schema()
export class Connection {
  @Prop({ required: true })
  IP: string;

  @Prop({ required: true })
  URL: string;

  @Prop({ required: true })
  lastActiveDate: Date;
}

export const ConnectionSchema = SchemaFactory.createForClass(Connection);
