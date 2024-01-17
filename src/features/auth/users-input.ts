import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';

export class UserCreatorToSql {
  login: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  confirmationCode = uuidv4();
  expirationDate: string;

  constructor(
    login: string,
    email: string,
    passwordHash: string,
    passwordSalt: string,
  ) {
    this.login = login;
    this.email = email;
    this.passwordHash = passwordHash;
    this.passwordSalt = passwordSalt;
    this.expirationDate = add(new Date(), { hours: 1 }).toISOString();
  }
}
