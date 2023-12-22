import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users-repository';
import { UsersQuery } from '../users-query';
import { UserInformation } from './users-output';
import { PageInformation } from '../../page-information';
import * as bcrypt from 'bcrypt';
import { UserCreator } from './users-input';
import { CreateUserInputModel } from '../users-models';
import { v4 as uuidv4 } from 'uuid';
import { LogInInputModel, NewPasswordInputModel } from '../../auth/auth-model';
import { ConnectRepository } from '../../connect/connect-repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly connectRepository: ConnectRepository,
  ) {}
  async createNewUser(dto: CreateUserInputModel): Promise<UserInformation> {
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await this._generateHash(dto.password, passwordSalt);
    const newUser = new UserCreator(
      dto.login,
      dto.email,
      passwordHash,
      passwordSalt,
    );

    const user = await this.usersRepository.createNewUser(newUser);
    return new UserInformation(
      user._id.toString(),
      dto.login,
      dto.email,
      user.accountData.createdAt,
    );
  }

  async getAllUsers(query: UsersQuery) {
    const usersCount = await this.usersRepository.usersCount(query);
    const allUsers = await this.usersRepository.getAllUsers(query);
    const filterUsers = allUsers.map(
      (p) =>
        new UserInformation(
          p._id.toString(),
          p.accountData.login,
          p.accountData.email,
          p.accountData.createdAt,
        ),
    );
    return new PageInformation(
      query.pageNumber,
      query.pageSize,
      usersCount,
      filterUsers,
    );
  }

  async deleteUserById(userId: string) {
    return await this.usersRepository.deleteUserById(userId);
  }

  async _generateHash(password: string, salt: string) {
    return await bcrypt.hash(password, salt);
  }

  async sendRecoveryCode(email: string) {
    const newRecoveryCode = uuidv4();
    //await this.emailManager.sendRecoveryCode(email, newRecoveryCode);
    await this.usersRepository.updateRecoveryCode(email, newRecoveryCode);
  }

  async updatePassword(body: NewPasswordInputModel) {
    const checkRecoveryCode = await this.usersRepository.checkRecoveryCode(
      body.recoveryCode,
    );
    if (!checkRecoveryCode) {
      return {
        errorsMessages: [
          {
            message: 'recovery code incorrect',
            field: 'recoveryCode',
          },
        ],
      };
    }

    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await this._generateHash(
      body.newPassword,
      passwordSalt,
    );
    await this.usersRepository.updatePassword(
      body.recoveryCode,
      passwordHash,
      passwordSalt,
    );
    await this.usersRepository.invalidRecoveryCode(body.recoveryCode);
    return true;
  }

  async checkCredentials(body: LogInInputModel) {
    const user = await this.usersRepository.findUserByLoginOrEmail(
      body.loginOrEmail,
    );
    if (!user) return null;
    const passwordHash = await this._generateHash(
      body.password,
      user.accountData.passwordSalt,
    );
    if (user.accountData.passwordHash !== passwordHash) {
      return null;
    }
    return user;
  }

  async updateUserId(userId: string, deviceId: string) {
    await this.connectRepository.updateUserId(userId, deviceId);
  }

  async updateToken(token: string, userId: string) {
    await this.usersRepository.updateToken(token, userId);
  }

  async getUserByEmail(email: any) {
    return await this.usersRepository.getUserByEmail(email);
  }
}
