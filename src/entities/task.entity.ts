import { Entity, Column, PrimaryGeneratedColumn, Index } from "typeorm";

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  priority: number;

  @Column()
  deadline: Date;

  @Column()
  created: Date;

  @Column({ default: false })
  completed: boolean;

  // @ManyToOne(() => User)
  // @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  // user: User;
  // TODO how to make it work with a FK?
  @Column()
  @Index()
  userId: number;

  toResponseObject() {
    return {
      id: this.id,
      name: this.name,
      priority: this.priority,
      deadline: this.deadline,
      created: this.created,
      isCompleted: this.completed,
    };
  }
}
