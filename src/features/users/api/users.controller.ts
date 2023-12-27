import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { UsersService } from '../application/users-service';
import { UsersQuery } from '../users-query';
import { CreateUserInputModel } from '../users-models';
import { BasicAuthGuard } from '../../../security/auth-guard';
import { ObjectIdPipe } from '../../../utils';

@UseGuards(BasicAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(201)
  async createUser(
    @Body() dto: CreateUserInputModel,
    @Res({ passthrough: true }) res: Response,
  ) {
    const checkInputDto = await this.usersService.checkDto(
      dto.login,
      dto.email,
    );
    if (checkInputDto) {
      res.status(400).send(checkInputDto);
      return;
    }
    return await this.usersService.createNewUser(dto);
  }

  @Get()
  async getUsers(@Query() query: UsersQuery) {
    return await this.usersService.getAllUsers(query);
  }

  @Delete('/:id')
  async deleteUser(
    @Param('id', ObjectIdPipe) userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const isDelete = await this.usersService.deleteUserById(userId);
    if (!isDelete) {
      res.status(HttpStatus.NOT_FOUND);
    } else res.status(HttpStatus.NO_CONTENT);
  }
}
