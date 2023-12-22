import { Body, Controller, HttpCode, Post, Request, Res } from '@nestjs/common';
import { UsersService } from '../../users/application/users-service';
import {
  EmailInputModel,
  LogInInputModel,
  NewPasswordInputModel,
} from '../auth-model';
import { Response } from 'express';
import { AuthService } from '../application/auth-service';
import { ConnectService } from '../../connect/connect-service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly connectService: ConnectService,
  ) {}

  @Post('/password-recovery')
  @HttpCode(204)
  async passwordRecovery(
    @Body() body: EmailInputModel,
    @Request() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = await this.authService.getUserIdFromRefreshToken(
      req.cookie.refreshToken,
    );
    const connection = await this.connectService.createConnectData(
      req.ip,
      req.originalUrl,
      req.headers['user-agent'] || 'hacker',
      userId,
    );
    if (!connection) {
      res.sendStatus(429);
      return;
    }
    await this.usersService.sendRecoveryCode(body.email);
    return true;
  }

  @Post('/new-password')
  async createNewPassword(
    @Body() body: NewPasswordInputModel,
    @Request() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = await this.authService.getUserIdFromRefreshToken(
      req.cookie.refreshToken,
    );
    const connection = await this.connectService.createConnectData(
      req.ip,
      req.originalUrl,
      req.headers['user-agent'] || 'hacker',
      userId,
    );
    if (!connection) {
      res.sendStatus(429);
      return;
    }
    const updatePassword = await this.usersService.updatePassword(body);
    if (updatePassword !== true) {
      return res.status(400).send(updatePassword);
    } else {
      return res.sendStatus(204);
    }
  }

  @Post('/login')
  @HttpCode(204)
  async login(
    @Body() body: LogInInputModel,
    @Request() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.usersService.checkCredentials(body);
    const connection = await this.connectService.createConnectData(
      req.ip,
      req.originalUrl,
      req.headers['user-agent'] || 'hacker',
      user?._id.toString() || null,
    );
    if (!connection) {
      res.sendStatus(429);
      return;
    }
    if (user) {
      const accessToken = await this.authService.createAccessToken(
        user._id.toString(),
      );
      const refreshToken = await this.authService.createRefreshToken(
        user._id.toString(),
        connection.deviceId,
      );
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
      });
      res.status(200).send({ accessToken: accessToken });
      return;
    } else {
      res.sendStatus(401);
    }
  }
}
