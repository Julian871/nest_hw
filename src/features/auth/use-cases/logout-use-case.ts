import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepo } from '../../users/infrastructure/users-repo';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../../security/auth-service';
import { SessionRepo } from '../../devices/infrastructure/session-repo';

export class LogoutCommand {
  constructor(public refreshToken: string) {}
}

@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler<LogoutCommand> {
  constructor(
    private readonly usersRepo: UsersRepo,
    private readonly authService: AuthService,
    private readonly sessionRepo: SessionRepo,
  ) {}

  async execute(command: LogoutCommand) {
    const userId = await this.authService.getUserIdFromRefreshToken(
      command.refreshToken,
    );
    if (!userId) throw new UnauthorizedException();

    const user = await this.usersRepo.checkUser(userId);
    if (!user) throw new UnauthorizedException();

    const deviceId = await this.authService.getDeviceIdRefreshToken(
      command.refreshToken,
    );
    const tokenActiveDate =
      await this.authService.getLastActiveDateRefreshToken(
        command.refreshToken,
      );
    await this.sessionRepo.deleteCurrentSession(deviceId, tokenActiveDate);
  }
}
