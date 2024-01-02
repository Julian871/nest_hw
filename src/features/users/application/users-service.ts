import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users-repository';
import { UserInfoToMe } from './users-output';
import * as bcrypt from 'bcrypt';
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
    const passwordHash = await bcrypt.hash(body.newPassword, passwordSalt);
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
    const passwordHash = await bcrypt.hash(
      dto.password,
      user.accountData.passwordSalt,
    );
    if (user.accountData.passwordHash !== passwordHash) {
      return null;
    }
    return user;
  }

  async updateToken(token: string, userId: string) {
    await this.usersRepository.updateToken(token, userId);
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
    console.log('userId: ', userId);
    const user = await this.usersRepository.getUserById(userId);
    return new UserInfoToMe(
      userId,
      user!.accountData.login,
      user!.accountData.email,
    );
  }
}
