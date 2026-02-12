import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Wallet } from './wallet.entity';
import { Order } from './order.entity';
import { Transfer } from './transfer.entity';

@Entity('currencies')
export class Currency {
  @PrimaryGeneratedColumn()
  currency_id: number;

  @Column({ unique: true })
  code: string; // BTC, ETH, XRP, DOGE, THB, USD

  @Column()
  type: string; // CRYPTO or FIAT

  @OneToMany(() => Wallet, (wallet) => wallet.currency)
  wallets: Wallet[];

  @OneToMany(() => Order, (order) => order.cryptoCurrency)
  cryptoOrders: Order[];

  @OneToMany(() => Order, (order) => order.fiatCurrency)
  fiatOrders: Order[];

  @OneToMany(() => Transfer, (transfer) => transfer.currency)
  transfers: Transfer[];
}

