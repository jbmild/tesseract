import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Warehouse } from './warehouse.entity';

@Entity('warehouse_exclusions')
export class WarehouseExclusion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Warehouse, (warehouse) => warehouse.exclusions, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'warehouseId' })
  warehouse: Warehouse;

  @Column({ nullable: false })
  warehouseId: number;

  // Exclusion ranges - null means "all" for that dimension
  // Values are stored as strings to support both numeric and alphabetic identifiers
  @Column({ type: 'varchar', length: 50, nullable: true })
  aisleFrom: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  aisleTo: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  bayFrom: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  bayTo: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  levelFrom: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  levelTo: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  binFrom: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  binTo: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
