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
import { UsersRepository } from '../../users/infrastructure/users-repository';
import { SessionRepository } from '../../devices/infrastructure/session-repository';
import { CreateUserInputModel } from '../../users/api/users-models';
import { BearerAuthGuard } from '../../../security/auth-guard';
import { CommandBus } from '@nestjs/cqrs';
import { CheckSessionGuard } from '../../../security/checkSession-guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import { RegistrationUserCommand } from '../registration-user-use-cases';
import { SessionGuard } from '../../../security/session-guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly sessionRepository: SessionRepository,
    private readonly usersRepository: UsersRepository,
    private commandBus: CommandBus,
  ) {}

  @UseGuards(ThrottlerGuard)
  @UseGuards(SessionGuard)
  @Post('/password-recovery')
  @HttpCode(204)
  async passwordRecovery(@Body() dto: EmailInputModel) {
    await this.usersService.sendRecoveryCode(dto.email);
    return true;
  }

  @UseGuards(ThrottlerGuard)
  @UseGuards(SessionGuard)
  @Post('/new-password')
  @HttpCode(204)
  async createNewPassword(@Body() body: NewPasswordInputModel) {
    await this.usersService.updatePassword(body);
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

    const accessToken = await this.authService.createAccessToken(user[0].id);
    const refreshToken = await this.authService.createRefreshToken(
      user[0].id,
      req.connect.deviceId,
    );
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
    });
    res.status(200).send({ accessToken: accessToken });
    const tokenLastActiveDate =
      await this.authService.getLastActiveDateRefreshToken(refreshToken);
    await this.sessionRepository.updateUserId(
      user[0].id,
      req.connect.deviceId,
      tokenLastActiveDate,
    );
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
    await this.sessionRepository.updateConnectDate(
      deviceId,
      tokenLastActiveDate,
    );

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
    res.status(200).send({ accessToken: token });
  }

  @UseGuards(ThrottlerGuard)
  @UseGuards(SessionGuard)
  @Post('/registration-confirmation')
  @HttpCode(204)
  async registrationConfirmation(@Body() dto: CodeInputModel, @Req() req: Re) {
    await this.usersService.checkConfirmationCode(
      dto.code,
      req.connect.deviceId,
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
    return await this.usersService.checkEmail(
      dto.email,
      req.connect.deviceId,
      req.connect.tokenLastActiveDate,
    );
  }

  @UseGuards(CheckSessionGuard)
  @Post('/logout')
  @HttpCode(204)
  async logout(@Req() req: Re) {
    const userId = await this.authService.getUserIdFromRefreshToken(
      req.cookies.refreshToken,
    );
    if (!userId) throw new UnauthorizedException();

    const user = await this.usersRepository.getUserById(userId);
    if (user.length === 0) throw new UnauthorizedException();

    const deviceId = await this.authService.getDeviceIdRefreshToken(
      req.cookies.refreshToken,
    );
    const tokenActiveDate =
      await this.authService.getLastActiveDateRefreshToken(
        req.cookies.refreshToken,
      );
    await this.sessionRepository.deleteCurrentSession(
      deviceId,
      tokenActiveDate,
    );
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
