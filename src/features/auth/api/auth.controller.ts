import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
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
import { UsersRepository } from '../../users/infrastructure/users-repository';
import { ConnectRepository } from '../../connect/connect-repository';
import { CreateUserInputModel } from '../../users/users-models';
import { BearerAuthGuard } from '../../../security/auth-guard';
import { CreateUserCommand } from '../../users/application/use-cases/create-user-use-case';
import { CommandBus } from '@nestjs/cqrs';
import { ConnectGuard } from '../../../security/connect-guard';
import { BlackListGuard } from '../../../security/black-list.guard';

@UseGuards(ConnectGuard, BlackListGuard)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly connectRepository: ConnectRepository,
    private readonly usersRepository: UsersRepository,
    private commandBus: CommandBus,
  ) {}

  @Post('/password-recovery')
  @HttpCode(204)
  async passwordRecovery(
    @Body() dto: EmailInputModel,
    @Req() req: Re,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (req.connect.count > 5) {
      res.sendStatus(429);
      return;
    }
    await this.usersService.sendRecoveryCode(dto.email);
    return true;
  }

  @Post('/new-password')
  @HttpCode(204)
  async createNewPassword(
    @Body() body: NewPasswordInputModel,
    @Req() req: Re,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (req.connect.count > 5) {
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
    @Body() dto: LogInInputModel,
    @Req() req: Re,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (req.connect.count > 5) {
      res.sendStatus(429);
      return;
    }

    const user = await this.usersService.checkCredentials(dto);
    if (user) {
      const accessToken = await this.authService.createAccessToken(
        user._id.toString(),
      );
      const refreshToken = await this.authService.createRefreshToken(
        user._id.toString(),
        req.connect.deviceId,
      );
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
      });
      res.status(200).send({ accessToken: accessToken });
      await this.connectRepository.updateUserId(user.id, req.connect.deviceId);
      return;
    } else {
      res.sendStatus(401);
    }
  }

  @Post('/refresh-token')
  async createNewTokens(
    @Req() req: Re,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!req.connect.userId) {
      res.sendStatus(401);
      return;
    }
    if (req.connect.count > 5) {
      res.sendStatus(429);
      return;
    }

    const token = await this.authService.createAccessToken(req.connect.userId);
    const refreshToken = await this.authService.createRefreshToken(
      req.connect.userId,
      req.connect.deviceId,
    );
    await this.usersService.updateToken(token, req.connect.userId);
    await this.usersRepository.updateBlackList(req.cookies.refreshToken);
    await this.connectRepository.updateConnectDate(req.connect.deviceId);
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
    res.status(200).send({ accessToken: token });
  }

  @Post('/registration-confirmation')
  async registrationConfirmation(
    @Body() dto: CodeInputModel,
    @Req() req: Re,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (req.connect.count > 5) {
      res.sendStatus(429);
      return;
    }
    const confirmation = await this.usersService.checkConfirmationCode(
      dto.code,
      req.connect.deviceId,
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
    @Body() dto: CreateUserInputModel,
    @Req() req: Re,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (req.connect.count > 5) {
      res.sendStatus(429);
      return;
    }
    const createUser = await this.commandBus.execute(
      new CreateUserCommand(dto, req.connect.deviceId),
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
    @Body() dto: EmailInputModel,
    @Req() req: Re,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (req.connect.count > 5) {
      res.sendStatus(429);
      return;
    }

    const user = await this.usersService.checkEmail(
      dto.email,
      req.connect.deviceId,
    );
    if (user !== true) {
      res.status(400).send(user);
      return;
    }
    return true;
  }

  @Post('/logout')
  @HttpCode(204)
  async logout(@Req() req: Re, @Res({ passthrough: true }) res: Response) {
    if (!req.connect.userId) {
      res.sendStatus(401);
      return;
    }
    const user = await this.usersRepository.getUserById(req.connect.userId);
    if (user === null) {
      res.sendStatus(401);
      return;
    }
    await this.connectRepository.deleteByDeviceId(req.connect.deviceId);
    await this.usersRepository.updateBlackList(req.cookies.refreshToken);
    return true;
  }

  @UseGuards(BearerAuthGuard)
  @Get('/me')
  @HttpCode(204)
  async getMyInfo(@Req() req: Re, @Res({ passthrough: true }) res: Response) {
    const user = await this.usersService.getUserToMe(req.connect.userId);
    if (user === null) {
      res.sendStatus(401);
      return;
    }
    res.status(200).send(user);
  }
}
