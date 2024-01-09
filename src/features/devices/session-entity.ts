import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SessionEntity {
  @PrimaryGeneratedColumn()
  Id: number;

  @Column()
  IP: string;

  @Column()
  lastActiveDate: string;

  @Column()
  deviceName: string;

  @Column()
  deviceId: string;

  @Column()
  userId: number;
}
