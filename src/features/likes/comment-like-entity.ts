import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'CommentLikes' })
export class CommentLikeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  commentId: number;

  @Column({ type: 'integer' })
  userId: number;

  @Column({ type: 'varchar' })
  userLogin: string;

  @Column({ type: 'varchar' })
  status: string;

  @Column({ type: 'timestamp with time zone' })
  addedAt: Date;
}
