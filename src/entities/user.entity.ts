import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Wallet } from './wallet.entity';
import { Order } from './order.entity';
import { Trade } from './trade.entity';
import { Transfer } from './transfer.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ default: 'ACTIVE' })
  status: string;

  @OneToMany(() => Wallet, (wallet) => wallet.user)
  wallets: Wallet[];

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => Trade, (trade) => trade.buyer)
  buyTrades: Trade[];

  @OneToMany(() => Trade, (trade) => trade.seller)
  sellTrades: Trade[];

  @OneToMany(() => Transfer, (transfer) => transfer.fromUser)
  outgoingTransfers: Transfer[];

  @OneToMany(() => Transfer, (transfer) => transfer.toUser)
  incomingTransfers: Transfer[];
}

