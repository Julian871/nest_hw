import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type connectDocument = HydratedDocument<Connect>;

@Schema()
export class Connect {
  @Prop({ required: true })
  IP: string;

  @Prop({ required: true })
  URL: string;

  @Prop({ required: true })
  lastActiveDate: Date;

  @Prop({ required: true })
  deviceName: string;

  @Prop({ required: true })
  deviceId: string;

  @Prop({ type: String || null, default: null })
  userId: string | null;
}

export const ConnectSchema = SchemaFactory.createForClass(Connect);
