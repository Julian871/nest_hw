import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../../src/features/users/api/users.controller';
import { UsersService } from '../../src/features/users/application/users-service';
import { newUserBody } from './input-model';
import { UserInformation } from '../../src/features/users/application/users-output';

describe('UsersController', () => {
  let usersController: UsersController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    }).compile();
    usersController = app.get<UsersController>(UsersController);
  });

  describe('root', () => {
    it('should return status 201 and new user', () => {
      expect(201);
      expect(usersController.createUser(newUserBody)).toBe({ UserInformation });
    });
  });
});
