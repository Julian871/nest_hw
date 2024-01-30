import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserInfoToMe } from './users-output';
import * as bcrypt from 'bcrypt';
import { LogInInputModel } from '../../auth/api/auth-model';
import { UsersRepo } from '../infrastructure/users-repo';
import { CommandBus } from '@nestjs/cqrs';
import { SendConfirmationCodeCommand } from '../../../email/send-caonfirmation-code-use-case';
import { UsersQueryRepo } from '../infrastructure/users-query-repo';
import { SessionRepo } from '../../devices/infrastructure/session-repo';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepo: UsersRepo,
    private readonly usersQueryRepo: UsersQueryRepo,
    private readonly sessionRepo: SessionRepo,
    private readonly commandBus: CommandBus,
  ) {}

  async generateHashAndSalt(password: string) {
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, passwordSalt);
    return { passwordSalt, passwordHash };
  }

  async checkCredentials(dto: LogInInputModel) {
    const user = await this.usersQueryRepo.getUserByLoginOrEmail(
      dto.loginOrEmail,
    );
    if (!user) throw new UnauthorizedException();
    const passwordHash = await bcrypt.hash(dto.password, user.passwordSalt);
    if (user.passwordHash !== passwordHash) throw new UnauthorizedException();
    return user;
  }

  async registrationConfirmation(
    code: string,
    deviceId: string,
    tokenLastActiveDate: string,
  ) {
    const user = await this.usersRepo.checkConfirmationCode(code);
    if (!user) {
      throw new BadRequestException('code');
    } else if (!user.isConfirmation) {
      const session = await this.sessionRepo.getSessionByDeviceId(deviceId);
      session!.userId = user.id;
      session!.lastActiveDate = tokenLastActiveDate;
      await this.sessionRepo.saveSession(session!);

      await this.commandBus.execute(
        new SendConfirmationCodeCommand(user.email, code),
      );
      user.isConfirmation = true;
      user.confirmationCode = null;
      await this.usersRepo.saveUser(user);
      return true;
    } else {
      throw new BadRequestException('code');
    }
  }

  async getUserToMe(userId: number) {
    const user = await this.usersRepo.checkUser(userId);
    if (!user) throw new UnauthorizedException();
    return new UserInfoToMe(user.id, user.login, user.email);
  }
}
