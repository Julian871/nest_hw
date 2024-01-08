import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

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
  @Prop({ required: true })
  confirmationCode: string;

  @Prop({
    required: true,
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
