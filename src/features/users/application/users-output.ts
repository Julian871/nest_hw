export class UserInformation {
  id: string;
  login: string;
  email: string;
  createdAt: string;

  constructor(id: number, login: string, email: string, createdAt: Date) {
    this.id = id.toString();
    this.login = login;
    this.email = email;
    this.createdAt = createdAt.toISOString();
  }
}

export class UserInfoToMe {
  login: string;
  email: string;
  userId: string;

  constructor(userId: number, login: string, email: string) {
    this.userId = userId.toString();
    this.login = login;
    this.email = email;
  }
}
