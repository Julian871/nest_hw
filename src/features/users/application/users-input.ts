import { v4 as uuidv4 } from 'uuid';

export class UserCreator {
  accountData: {
    login: string;
    email: string;
    passwordHash: string;
    passwordSalt: string;
    createdAt: string;
  };
  emailConfirmation: {
    confirmationCode: string;
    expirationDate: Date;
  };
  constructor(
    login: string,
    email: string,
    passwordHash: string,
    passwordSalt: string,
  ) {
    const createdAt = new Date().toISOString();
    this.accountData = { login, email, passwordHash, passwordSalt, createdAt };
    const confirmationCode = uuidv4();
    const expirationDate = new Date();
    this.emailConfirmation = { confirmationCode, expirationDate };
  }
}
