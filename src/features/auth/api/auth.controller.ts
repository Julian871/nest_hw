import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../../users/application/users-service';
import {
  CodeInputModel,
  EmailInputModel,
  LogInInputModel,
  NewPasswordInputModel,
} from './auth-model';
import { Response, Request as Re } from 'express';
import { AuthService } from '../../../security/auth-service';
import { CreateUserInputModel } from '../../users/api/users-models';
import { BearerAuthGuard } from '../../../security/auth-guard';
import { CommandBus } from '@nestjs/cqrs';
import { CheckSessionGuard } from '../../../security/checkSession-guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import { RegistrationUserCommand } from '../use-cases/registration-user-use-case';
import { SessionGuard } from '../../../security/session-guard';
import { SendRecoveryCodeCommand } from '../../../email/send-recovery-code-use-case';
import { UpdatePasswordCommand } from '../../users/application/use-cases/update-password-use-case';
import { LogoutCommand } from '../use-cases/logout-use-case';
import { RegistrationEmailResendingCommand } from '../use-cases/registration-email-resending-use-case';
import { SessionRepo } from '../../devices/infrastructure/session-repo';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly sessionRepo: SessionRepo,
    private commandBus: CommandBus,
  ) {}

  @UseGuards(ThrottlerGuard)
  @UseGuards(SessionGuard)
  @Post('/password-recovery')
  @HttpCode(204)
  async passwordRecovery(@Body() dto: EmailInputModel) {
    await this.commandBus.execute(new SendRecoveryCodeCommand(dto.email));
    return true;
  }

  @UseGuards(ThrottlerGuard)
  @UseGuards(SessionGuard)
  @Post('/new-password')
  @HttpCode(204)
  async createNewPassword(@Body() body: NewPasswordInputModel) {
    await this.commandBus.execute(new UpdatePasswordCommand(body));
    return true;
  }

  @UseGuards(ThrottlerGuard)
  @UseGuards(SessionGuard)
  @Post('/login')
  @HttpCode(204)
  async login(
    @Body() dto: LogInInputModel,
    @Req() req: Re,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.usersService.checkCredentials(dto);

    const accessToken = await this.authService.createAccessToken(user.id);
    const refreshToken = await this.authService.createRefreshToken(
      user.id,
      req.connect.deviceId!,
    );
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
    });
    res.status(200).send({ accessToken: accessToken });
    const tokenLastActiveDate =
      await this.authService.getLastActiveDateRefreshToken(refreshToken);

    const session = await this.sessionRepo.getSessionByDeviceId(
      req.connect.deviceId!,
    );
    session!.userId = user.id;
    session!.lastActiveDate = tokenLastActiveDate;
    await this.sessionRepo.saveSession(session!);
    return;
  }

  @UseGuards(CheckSessionGuard)
  @Post('/refresh-token')
  async createNewTokens(
    @Req() req: Re,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = await this.authService.getUserIdFromRefreshToken(
      req.cookies.refreshToken,
    );
    if (!userId) throw new UnauthorizedException();

    const deviceId = await this.authService.getDeviceIdRefreshToken(
      req.cookies.refreshToken,
    );
    const token = await this.authService.createAccessToken(userId);
    const refreshToken = await this.authService.createRefreshToken(
      userId,
      deviceId,
    );
    const tokenLastActiveDate =
      await this.authService.getLastActiveDateRefreshToken(refreshToken);

    const session = await this.sessionRepo.getSessionByDeviceId(deviceId);
    session!.lastActiveDate = tokenLastActiveDate;
    await this.sessionRepo.saveSession(session!);

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
    res.status(200).send({ accessToken: token });
  }

  @UseGuards(ThrottlerGuard)
  @UseGuards(SessionGuard)
  @Post('/registration-confirmation')
  @HttpCode(204)
  async registrationConfirmation(@Body() dto: CodeInputModel, @Req() req: Re) {
    await this.usersService.registrationConfirmation(
      dto.code,
      req.connect.deviceId!,
      req.connect.tokenLastActiveDate,
    );
    return true;
  }

  @UseGuards(ThrottlerGuard)
  @UseGuards(SessionGuard)
  @Post('/registration')
  @HttpCode(204)
  async registration(@Body() dto: CreateUserInputModel) {
    return await this.commandBus.execute(new RegistrationUserCommand(dto));
  }

  @UseGuards(ThrottlerGuard)
  @UseGuards(SessionGuard)
  @Post('/registration-email-resending')
  @HttpCode(204)
  async emailResending(@Body() dto: EmailInputModel, @Req() req: Re) {
    return await this.commandBus.execute(
      new RegistrationEmailResendingCommand(
        dto.email,
        req.connect.deviceId!,
        req.connect.tokenLastActiveDate,
      ),
    );
  }

  @UseGuards(CheckSessionGuard)
  @Post('/logout')
  @HttpCode(204)
  async logout(@Req() req: Re) {
    await this.commandBus.execute(new LogoutCommand(req.cookies.refreshToken));
    return true;
  }

  @UseGuards(BearerAuthGuard)
  @Get('/me')
  @HttpCode(204)
  async getMyInfo(@Req() req: Re, @Res({ passthrough: true }) res: Response) {
    const userId = await this.authService.getUserIdFromAccessToken(
      req.headers.authorization!,
    );
    const user = await this.usersService.getUserToMe(+userId);
    res.status(200).send(user);
  }
}
