import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { Currency } from './currency.entity';

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn()
  wallet_id: number;

  @ManyToOne(() => User, (user) => user.wallets, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Currency, (currency) => currency.wallets, {
    onDelete: 'CASCADE',
  })
  currency: Currency;

  @Column({ type: 'decimal', precision: 18, scale: 8, default: 0 })
  balance: string;

  @Column({ type: 'decimal', precision: 18, scale: 8, default: 0 })
  locked_balance: string;
}

