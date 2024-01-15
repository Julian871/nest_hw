import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Blogs' })
export class BlogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  websiteUrl: string;

  @Column()
  createdAt: string;

  @Column({ type: 'boolean', default: true })
  isMembership: boolean;
}
