import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Session' })
export class SessionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  IP: string;

  @Column()
  lastActiveDate: string;

  @Column()
  deviceName: string;

  @Column()
  deviceId: string;

  @Column({ type: 'varchar', nullable: true })
  userId: number | null;
}
