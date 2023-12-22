import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type userDocument = HydratedDocument<User>;

@Schema()
export class AccountData {
  @Prop({ required: true })
  login: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true })
  passwordSalt: string;

  @Prop({ required: true })
  createdAt: Date;
}

export const AccountDataSchema = SchemaFactory.createForClass(AccountData);

@Schema()
export class EmailConfirmation {
  @Prop({ default: uuidv4() })
  confirmationCode: string;

  @Prop({
    default: new Date(),
  })
  expirationDate: Date;

  @Prop({ default: false })
  isConfirmation: boolean;
}

export const EmailConfirmationSchema =
  SchemaFactory.createForClass(EmailConfirmation);

@Schema()
export class User {
  @Prop({ type: AccountDataSchema, required: true })
  accountData: AccountData;

  @Prop({ type: EmailConfirmationSchema, default: new EmailConfirmation() })
  emailConfirmation: EmailConfirmation;

  @Prop({ type: String || null, default: null })
  recoveryCode: string | null;

  @Prop({ type: String || null, default: null })
  accessToken: string | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
