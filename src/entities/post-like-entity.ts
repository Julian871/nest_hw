import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user-entity';
import { Post } from './post-entity';

@Entity({ name: 'PostLikes' })
export class PostLike {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  status: string;

  @Column({ type: 'timestamp with time zone' })
  addedAt: Date;

  @ManyToOne('User', 'postLikes')
  owner: User;

  @ManyToOne('Post', 'postLikes')
  post: Post;
}
