export class UserInformation {
  id: string;
  login: string;
  email: string;
  createdAt: string;

  constructor(id: string, login: string, email: string, createdAt: Date) {
    this.id = id;
    this.login = login;
    this.email = email;
    this.createdAt = createdAt.toISOString();
  }
}
