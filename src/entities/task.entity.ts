import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
import { TaskDto } from '../tasks/task.dto';
import { TaskUpdateDto } from '../tasks/task-update.dto';

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

export function fromTaskDto(taskDto: TaskDto) {
  const task = new Task();
  task.name = taskDto.name;
  task.priority = taskDto.priority;
  task.deadline = taskDto.deadline;
  return task;
}

export function fromTaskUpdateDto(taskUpdateDto: TaskUpdateDto): Partial<Task> {
  const taskUpdate: Partial<Task> = {};
  if (taskUpdateDto.name !== undefined) {
    taskUpdate.name = taskUpdateDto.name;
  }
  if (taskUpdateDto.priority !== undefined) {
    taskUpdate.priority = taskUpdateDto.priority;
  }
  if (taskUpdateDto.deadline !== undefined) {
    taskUpdate.deadline = taskUpdateDto.deadline;
  }
  if (taskUpdateDto.completed !== undefined) {
    taskUpdate.completed = taskUpdateDto.completed;
  }
  return taskUpdate;
}
