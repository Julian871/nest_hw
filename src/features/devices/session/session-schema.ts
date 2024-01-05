import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type sessionDocument = HydratedDocument<Session>;

@Schema()
export class Session {
  @Prop({ required: true })
  IP: string;

  @Prop({ required: true })
  lastActiveDate: Date;

  @Prop({ required: true })
  deviceName: string;

  @Prop({ required: true })
  deviceId: string;

  @Prop({ type: String || null, default: null })
  userId: string | null;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
