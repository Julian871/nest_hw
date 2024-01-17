import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'PostLikes' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  postId: string;

  @Column({ type: 'varchar' })
  userId: string;

  @Column({ type: 'varchar' })
  status: string;

  @Column({ type: 'timestamp with time zone' })
  addedAt: Date;
}
