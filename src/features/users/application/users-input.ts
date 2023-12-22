export class UserCreator {
  accountData: {
    login: string;
    email: string;
    passwordHash: string;
    passwordSalt: string;
    createdAt: string;
  };

  constructor(
    login: string,
    email: string,
    passwordHash: string,
    passwordSalt: string,
  ) {
    const createdAt = new Date().toISOString();
    this.accountData = { login, email, passwordHash, passwordSalt, createdAt };
  }
}
