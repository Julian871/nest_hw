import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Posts' })
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar' })
  shortDescription: string;

  @Column({ type: 'varchar', nullable: true })
  content: string;

  @Column({ type: 'integer' })
  blogId: number;

  @Column({ type: 'varchar' })
  blogName: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  createdAt: Date;
}
