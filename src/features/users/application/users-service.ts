import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users-repository';
import { UserInfoToMe } from './users-output';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import {
  LogInInputModel,
  NewPasswordInputModel,
} from '../../auth/api/auth-model';
import { SessionRepository } from '../../devices/infrastructure/session-repository';
import { EmailManager } from '../../../email/email-manager';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly emailManager: EmailManager,
  ) {}

  async sendRecoveryCode(email: string) {
    const newRecoveryCode = uuidv4();
    await this.emailManager.sendRecoveryCode(email, newRecoveryCode);
    await this.usersRepository.updateRecoveryCode(email, newRecoveryCode);
  }

  async updatePassword(body: NewPasswordInputModel) {
    const checkRecoveryCode = await this.usersRepository.checkRecoveryCode(
      body.recoveryCode,
    );
    if (!checkRecoveryCode) throw new BadRequestException('recovery code');

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
    if (user.length === 0) throw new UnauthorizedException();
    const passwordHash = await bcrypt.hash(dto.password, user[0].passwordSalt);
    if (user[0].passwordHash !== passwordHash)
      throw new UnauthorizedException();
    return user;
  }

  async checkConfirmationCode(
    code: string,
    deviceId: string,
    tokenLastActiveDate: string,
  ) {
    const user = await this.usersRepository.getUserByConfirmationCode(code);
    if (user.length === 0) {
      throw new BadRequestException('code');
    } else if (!user[0].isConfirmation) {
      await this.sessionRepository.updateUserId(
        user[0].id,
        deviceId,
        tokenLastActiveDate,
      );
      await this.emailManager.sendConfirmationLink(
        user[0].email,
        user[0].confirmationCode,
      );
      await this.usersRepository.updateConfirmStatus(user[0].id);
      return true;
    } else {
      throw new BadRequestException('code');
    }
  }

  async checkEmail(
    email: string,
    deviceId: string,
    tokenLastActiveDate: string,
  ) {
    const user = await this.usersRepository.checkUserByEmail(email);
    const newConfirmationCode = uuidv4();
    if (user.length === 0) {
      throw new BadRequestException('email');
    } else if (!user[0].isConfirmation) {
      await this.sessionRepository.updateUserId(
        user[0].id,
        deviceId,
        tokenLastActiveDate,
      );
      await this.emailManager.sendConfirmationLink(email, newConfirmationCode);
      await this.usersRepository.updateConfirmCode(
        user[0].id,
        newConfirmationCode,
      );
      return true;
    } else {
      throw new BadRequestException('email');
    }
  }

  async getUserToMe(userId: string | null) {
    const user = await this.usersRepository.getUserById(userId);
    if (user.length === 0) throw new UnauthorizedException();
    return new UserInfoToMe(user[0].id, user[0].login, user[0].email);
  }
}
