import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { UsersQuery } from './users-query';
import { CreateUserInputModel } from './users-models';
import { BasicAuthGuard } from '../../../security/auth-guard';
import { CreateUserCommand } from '../application/use-cases/create-user-use-case';
import { GetUserCommand } from '../application/use-cases/get-users-use-case';
import { DeleteUserCommand } from '../application/use-cases/delete-user-use-case';
import { CommandBus } from '@nestjs/cqrs';
import { IsNumberPipe } from '../../../pipes/integerId.pipe';

@UseGuards(BasicAuthGuard)
@Controller('sa/users')
export class UsersController {
  constructor(private commandBus: CommandBus) {}

  @Post()
  @HttpCode(201)
  async createUser(
    @Body() dto: CreateUserInputModel,
    @Res({ passthrough: true }) res: Response,
  ) {
    const createUser = await this.commandBus.execute(
      new CreateUserCommand(dto),
    );
    res.status(201).send(createUser);
  }

  @Get()
  async getUsers(@Query() query: UsersQuery) {
    return await this.commandBus.execute(new GetUserCommand(query));
  }

  @Delete('/:id')
  @HttpCode(204)
  async deleteUser(@Param('id', IsNumberPipe) userId: string) {
    return this.commandBus.execute(new DeleteUserCommand(+userId));
  }
}
