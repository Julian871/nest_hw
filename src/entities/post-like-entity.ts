import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'PostLikes' })
export class PostLike {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  postId: number;

  @Column({ type: 'integer' })
  userId: number;

  @Column({ type: 'varchar' })
  userLogin: string;

  @Column({ type: 'varchar' })
  status: string;

  @Column({ type: 'timestamp with time zone' })
  addedAt: Date;
}
