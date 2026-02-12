import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Trade } from './trade.entity';

@Entity('escrows')
export class Escrow {
  @PrimaryGeneratedColumn()
  escrow_id: number;

  @OneToOne(() => Trade, (trade) => trade.escrow, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trade_id' })
  trade: Trade;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  amount_locked: string;

  @Column({ default: 'LOCKED' })
  status: string; // LOCKED, RELEASED
}

