import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users-repository';
import { UsersQuery } from '../users-query';
import { UserInformation, UserInfoToMe } from './users-output';
import { PageInformation } from '../../page-information';
import * as bcrypt from 'bcrypt';
import { UserCreator } from './users-input';
import { CreateUserInputModel } from '../users-models';
import { v4 as uuidv4 } from 'uuid';
import { LogInInputModel, NewPasswordInputModel } from '../../auth/auth-model';
import { ConnectRepository } from '../../connect/connect-repository';
import { EmailManager } from '../../../email/email-manager';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly connectRepository: ConnectRepository,
    private readonly emailManager: EmailManager,
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

  async checkDto(login: string, email: string) {
    const checkLogin = await this.usersRepository.getUserByLogin(login);
    if (checkLogin)
      return {
        errorsMessages: [{ message: 'Login exist', field: 'login' }],
      };
    const checkEmail = await this.usersRepository.getUserByEmail(email);
    if (checkEmail)
      return {
        errorsMessages: [{ message: 'Email exist', field: 'email' }],
      };
    return false;
  }

  async deleteUserById(userId: string) {
    return await this.usersRepository.deleteUserById(userId);
  }

  async _generateHash(password: string, salt: string) {
    return await bcrypt.hash(password, salt);
  }

  async sendRecoveryCode(email: string) {
    const newRecoveryCode = uuidv4();
    console.log('newRecoveryCode: ', newRecoveryCode);
    await this.emailManager.sendRecoveryCode(email, newRecoveryCode);
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

  async checkCredentials(dto: LogInInputModel) {
    const user = await this.usersRepository.findUserByLoginOrEmail(
      dto.loginOrEmail,
    );
    if (!user) return null;
    const passwordHash = await this._generateHash(
      dto.password,
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

  async checkConfirmationCode(code: string, deviceId: string) {
    const user = await this.usersRepository.getUserByConfirmationCode(code);
    if (!user) {
      return { errorsMessages: [{ message: 'Incorrect code', field: 'code' }] };
    } else if (!user.emailConfirmation.isConfirmation) {
      await this.connectRepository.updateUserId(user._id.toString(), deviceId);
      await this.emailManager.sendConfirmationLink(
        user.accountData.email,
        user.emailConfirmation.confirmationCode,
      );
      await this.usersRepository.updateConfirmStatus(user._id.toString());
      return true;
    } else {
      return { errorsMessages: [{ message: 'code confirm', field: 'code' }] };
    }
  }

  async finalOfRegistration(user: UserInformation, deviceId: string) {
    const fullUser = await this.usersRepository.getUserById(user.id);
    console.log('deviceId: ', deviceId);
    await this.connectRepository.updateUserId(user.id, deviceId);
    await this.emailManager.sendConfirmationLink(
      user.email,
      fullUser!.emailConfirmation.confirmationCode,
    );
  }

  async checkEmail(email: string, deviceId: string) {
    const user = await this.usersRepository.checkUserByEmail(email);
    const newConfirmationCode = uuidv4();
    if (!user) {
      return {
        errorsMessages: [{ message: 'Incorrect email', field: 'email' }],
      };
    } else if (!user.emailConfirmation.isConfirmation) {
      await this.connectRepository.updateUserId(user._id.toString(), deviceId);
      await this.emailManager.sendConfirmationLink(
        user.accountData.email,
        newConfirmationCode,
      );
      await this.usersRepository.updateConfirmCode(
        user._id.toString(),
        newConfirmationCode,
      );
      return true;
    } else {
      return { errorsMessages: [{ message: 'no confirm', field: 'email' }] };
    }
  }

  async getUserToMe(userId: string) {
    const user = await this.usersRepository.getUserById(userId);
    return new UserInfoToMe(
      userId,
      user!.accountData.login,
      user!.accountData.email,
    );
  }
}
