import { Module } from '@nestjs/common';
import { TestingController } from './testing-controller';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature()],
  controllers: [TestingController],
})
export class TestingModule {}
