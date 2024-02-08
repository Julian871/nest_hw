import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user-entity';
import { Comment } from './comment-entity';

@Entity({ name: 'CommentLikes' })
export class CommentLike {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  status: string;

  @Column({ type: 'timestamp with time zone' })
  addedAt: Date;

  @ManyToOne('User', 'commentLikes')
  owner: User;

  @ManyToOne('Comment', 'commentLikes')
  comment: Comment;
}
