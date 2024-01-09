import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';

export class UserCreatorToSql {
  login: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  createdAt: string;
  confirmationCode = uuidv4();
  expirationDate: string;
  isConfirmation: boolean;
  recoveryCode: null;

  constructor(
    login: string,
    email: string,
    passwordHash: string,
    passwordSalt: string,
  ) {
    const date = new Date();
    const formattedDate = date.toISOString().slice(0, 19).replace('T', ' ');
    this.login = login;
    this.email = email;
    this.passwordHash = passwordHash;
    this.passwordSalt = passwordSalt;
    this.expirationDate = add(new Date(), { hours: 25 })
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');
    this.createdAt = formattedDate;
    this.isConfirmation = false;
    this.recoveryCode = null;
  }
}
