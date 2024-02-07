import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Session' })
export class Session {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  IP: string;

  @Column({ type: 'varchar' })
  lastActiveDate: string;

  @Column({ type: 'varchar' })
  deviceName: string;

  @Column({ type: 'varchar', nullable: true })
  deviceId: string | null;

  @Column({ type: 'varchar', nullable: true })
  userId: number | null;
}
