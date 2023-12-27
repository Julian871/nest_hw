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

export class UserInfoToMe {
  login: string;
  email: string;
  userId: string;

  constructor(userId: string, login: string, email: string) {
    this.userId = userId;
    this.login = login;
    this.email = email;
  }
}
