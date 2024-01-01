import {
  Body,
  Controller,
  Get,
  HttpCode,
  Ip,
  Post,
  Req,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../../users/application/users-service';
import {
  CodeInputModel,
  EmailInputModel,
  LogInInputModel,
  NewPasswordInputModel,
} from '../auth-model';
import { Response, Request as Re } from 'express';
import { AuthService } from '../../../security/auth-service';
import { ConnectService } from '../../connect/connect-service';
import { UsersRepository } from '../../users/infrastructure/users-repository';
import { ConnectRepository } from '../../connect/connect-repository';
import { CreateUserInputModel } from '../../users/users-models';
import { BearerAuthGuard } from '../../../security/auth-guard';
import { CreateUserCommand } from '../../users/application/use-cases/create-user-use-case';
import { CommandBus } from '@nestjs/cqrs';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly connectService: ConnectService,
    private readonly connectRepository: ConnectRepository,
    private readonly usersRepository: UsersRepository,
    private commandBus: CommandBus,
  ) {}

  @Post('/password-recovery')
  @HttpCode(204)
  async passwordRecovery(
    @Body() dto: EmailInputModel,
    @Req() req: Re,
    @Ip() ip,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = await this.authService.getUserIdFromRefreshToken(
      req.cookies.refreshToken,
    );
    const connection = await this.connectService.createConnectData(
      ip,
      req.originalUrl,
      req.headers['user-agent'] || 'hacker',
      userId,
    );
    if (!connection) {
      res.sendStatus(429);
      return;
    }
    await this.usersService.sendRecoveryCode(dto.email);
    return true;
  }

  @Post('/new-password')
  @HttpCode(204)
  async createNewPassword(
    @Ip() ip,
    @Body() body: NewPasswordInputModel,
    @Request() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = await this.authService.getUserIdFromRefreshToken(
      req.cookies.refreshToken,
    );
    const connection = await this.connectService.createConnectData(
      ip,
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
      res.status(400).send(updatePassword);
      return;
    }
    return true;
  }

  @Post('/login')
  @HttpCode(204)
  async login(
    @Ip() ip,
    @Body() dto: LogInInputModel,
    @Req() req,
    @Request() request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.usersService.checkCredentials(dto);
    const connection = await this.connectService.createConnectData(
      ip,
      request.originalUrl,
      request.headers['user-agent'] || 'hacker',
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

  @Post('/refresh-token')
  async createNewTokens(
    @Ip() ip,
    @Request() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = await this.authService.getUserIdFromRefreshToken(
      req.cookies.refreshToken,
    );
    const connection = await this.connectService.createConnectData(
      ip,
      req.originalUrl,
      req.headers['user-agent'] || 'hacker',
      userId,
    );
    if (!userId) {
      res.sendStatus(401);
      return;
    }
    if (!connection) {
      res.sendStatus(429);
      return;
    }

    const token = await this.authService.createAccessToken(userId);
    const deviceId = await this.authService.getDeviceIdRefreshToken(
      req.cookies.refreshToken,
    );
    const refreshToken = await this.authService.createRefreshToken(
      userId,
      deviceId,
    );
    await this.usersService.updateToken(token, userId);
    await this.usersRepository.updateBlackList(req.cookies.refreshToken);
    await this.connectRepository.updateConnectDate(deviceId);
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
    res.status(200).send({ accessToken: token });
  }

  @Post('/registration-confirmation')
  async registrationConfirmation(
    @Ip() ip,
    @Body() dto: CodeInputModel,
    @Request() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = await this.authService.getUserIdFromRefreshToken(
      req.cookies.refreshToken,
    );
    const connection = await this.connectService.createConnectData(
      ip,
      req.originalUrl,
      req.headers['user-agent'] || 'hacker',
      userId,
    );
    if (!connection) {
      res.sendStatus(429);
      return;
    }
    const deviceId = await this.authService.getDeviceIdRefreshToken(
      req.cookies.refreshToken,
    );
    const confirmation = await this.usersService.checkConfirmationCode(
      dto.code,
      deviceId,
    );
    if (confirmation === true) {
      res.sendStatus(204);
      return;
    } else {
      res.status(400).send(confirmation);
      return;
    }
  }

  @Post('/registration')
  @HttpCode(204)
  async registration(
    @Ip() ip,
    @Body() dto: CreateUserInputModel,
    @Request() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = await this.authService.getUserIdFromRefreshToken(
      req.cookies.refreshToken,
    );
    const connection = await this.connectService.createConnectData(
      ip,
      req.originalUrl,
      req.headers['user-agent'] || 'hacker',
      userId,
    );
    if (!connection) {
      res.sendStatus(429);
      return;
    }
    const createUser = await this.commandBus.execute(
      new CreateUserCommand(dto, 'deviceID'),
    );
    if (!createUser) {
      res.status(400).send({
        errorsMessages: [{ message: 'Login or Email exist', field: 'exist' }],
      });
      return;
    }
    res.status(204);
  }

  @Post('/registration-email-resending')
  @HttpCode(204)
  async emailResending(
    @Ip() ip,
    @Body() dto: EmailInputModel,
    @Request() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = await this.authService.getUserIdFromRefreshToken(
      req.cookies.refreshToken,
    );
    const connection = await this.connectService.createConnectData(
      ip,
      req.originalUrl,
      req.headers['user-agent'] || 'hacker',
      userId,
    );
    if (!connection) {
      res.sendStatus(429);
      return;
    }

    const user = await this.usersService.checkEmail(
      dto.email,
      connection.deviceId,
    );
    if (user !== true) {
      res.status(400).send(user);
      return;
    }
    return true;
  }

  @Post('/logout')
  @HttpCode(204)
  async logout(@Request() req, @Res({ passthrough: true }) res: Response) {
    const userId = await this.authService.getUserIdFromRefreshToken(
      req.cookies.refreshToken,
    );
    const deviceId = await this.authService.getDeviceIdRefreshToken(
      req.cookies.refreshToken,
    );
    if (!userId) {
      res.sendStatus(401);
      return;
    }
    const user = await this.usersRepository.getUserById(userId);
    if (user === null) {
      res.sendStatus(401);
      return;
    }
    await this.connectRepository.deleteByDeviceId(deviceId);
    await this.usersRepository.updateBlackList(req.cookies.refreshToken);
    return true;
  }

  @UseGuards(BearerAuthGuard)
  @Get('/me')
  @HttpCode(204)
  async getMyInfo(@Request() req, @Res({ passthrough: true }) res: Response) {
    const userId = await this.authService.getUserIdFromRefreshToken(
      req.cookies.refreshToken,
    );
    const user = await this.usersService.getUserToMe(userId);
    if (user === null) {
      res.sendStatus(401);
      return;
    }
    res.status(200).send(user);
  }
}
