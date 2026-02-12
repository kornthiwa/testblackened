import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Currency } from '../entities/currency.entity';
import { Wallet } from '../entities/wallet.entity';
import { Order } from '../entities/order.entity';
import { Trade } from '../entities/trade.entity';
import { Escrow } from '../entities/escrow.entity';
import { Transfer } from '../entities/transfer.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(Currency)
    private readonly currencyRepo: Repository<Currency>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(Trade)
    private readonly tradeRepo: Repository<Trade>,
    @InjectRepository(Escrow)
    private readonly escrowRepo: Repository<Escrow>,
    @InjectRepository(Transfer)
    private readonly transferRepo: Repository<Transfer>,
  ) {}

  async onModuleInit() {
    const count = await this.currencyRepo.count();
    if (count > 0) {
      return;
    }
    await this.run();
  }

  async run() {
    const currenciesData = [
      { code: 'BTC', type: 'CRYPTO' },
      { code: 'ETH', type: 'CRYPTO' },
      { code: 'XRP', type: 'CRYPTO' },
      { code: 'DOGE', type: 'CRYPTO' },
      { code: 'THB', type: 'FIAT' },
      { code: 'USD', type: 'FIAT' },
    ];
    const currencies = await this.currencyRepo.save(
      currenciesData.map((c) => this.currencyRepo.create(c)),
    );

    const btc = currencies.find((c) => c.code === 'BTC')!;
    const eth = currencies.find((c) => c.code === 'ETH')!;
    const xrp = currencies.find((c) => c.code === 'XRP')!;
    const doge = currencies.find((c) => c.code === 'DOGE')!;
    const thb = currencies.find((c) => c.code === 'THB')!;
    const usd = currencies.find((c) => c.code === 'USD')!;

    // ---------- Users (5 คน) ----------
    const alice = await this.userRepo.save(
      this.userRepo.create({
        email: 'alice@example.com',
        password_hash: 'password',
      }),
    );
    const bob = await this.userRepo.save(
      this.userRepo.create({
        email: 'bob@example.com',
        password_hash: 'password',
      }),
    );
    const charlie = await this.userRepo.save(
      this.userRepo.create({
        email: 'charlie@example.com',
        password_hash: 'password',
      }),
    );
    const diana = await this.userRepo.save(
      this.userRepo.create({
        email: 'diana@example.com',
        password_hash: 'password',
      }),
    );
    const eve = await this.userRepo.save(
      this.userRepo.create({
        email: 'eve@example.com',
        password_hash: 'password',
      }),
    );

    const users = [alice, bob, charlie, diana, eve];

    // ---------- Wallets (แต่ละคนมีหลายสกุล) ----------
    const walletData: Array<{
      user: User;
      currency: Currency;
      balance: string;
    }> = [
      { user: alice, currency: btc, balance: '2.5' },
      { user: alice, currency: eth, balance: '10' },
      { user: alice, currency: xrp, balance: '5000' },
      { user: alice, currency: doge, balance: '10000' },
      { user: alice, currency: thb, balance: '500000' },
      { user: alice, currency: usd, balance: '15000' },
      { user: bob, currency: btc, balance: '1.2' },
      { user: bob, currency: eth, balance: '5' },
      { user: bob, currency: thb, balance: '300000' },
      { user: bob, currency: usd, balance: '8000' },
      { user: charlie, currency: btc, balance: '0.5' },
      { user: charlie, currency: eth, balance: '20' },
      { user: charlie, currency: xrp, balance: '20000' },
      { user: charlie, currency: thb, balance: '200000' },
      { user: diana, currency: btc, balance: '3' },
      { user: diana, currency: doge, balance: '50000' },
      { user: diana, currency: thb, balance: '1000000' },
      { user: diana, currency: usd, balance: '25000' },
      { user: eve, currency: eth, balance: '15' },
      { user: eve, currency: xrp, balance: '30000' },
      { user: eve, currency: thb, balance: '150000' },
      { user: eve, currency: usd, balance: '12000' },
    ];

    for (const w of walletData) {
      await this.walletRepo.save(
        this.walletRepo.create({
          user: w.user,
          currency: w.currency,
          balance: w.balance,
          locked_balance: '0',
        }),
      );
    }

    // ---------- Orders (หลายคน หลายคู่ ทั้ง BUY และ SELL) ----------
    const order1 = await this.orderRepo.save(
      this.orderRepo.create({
        user: alice,
        type: 'SELL',
        cryptoCurrency: btc,
        fiatCurrency: thb,
        price: '2000000',
        amount: '0.5',
        status: 'OPEN',
      }),
    );
    const order2 = await this.orderRepo.save(
      this.orderRepo.create({
        user: bob,
        type: 'BUY',
        cryptoCurrency: btc,
        fiatCurrency: thb,
        price: '1950000',
        amount: '0.3',
        status: 'OPEN',
      }),
    );
    const order3 = await this.orderRepo.save(
      this.orderRepo.create({
        user: charlie,
        type: 'SELL',
        cryptoCurrency: eth,
        fiatCurrency: thb,
        price: '95000',
        amount: '2',
        status: 'OPEN',
      }),
    );
    const order4 = await this.orderRepo.save(
      this.orderRepo.create({
        user: diana,
        type: 'SELL',
        cryptoCurrency: btc,
        fiatCurrency: usd,
        price: '58000',
        amount: '1',
        status: 'OPEN',
      }),
    );
    const order5 = await this.orderRepo.save(
      this.orderRepo.create({
        user: eve,
        type: 'BUY',
        cryptoCurrency: xrp,
        fiatCurrency: usd,
        price: '0.52',
        amount: '5000',
        status: 'OPEN',
      }),
    );
    const order6 = await this.orderRepo.save(
      this.orderRepo.create({
        user: alice,
        type: 'SELL',
        cryptoCurrency: doge,
        fiatCurrency: thb,
        price: '3.5',
        amount: '5000',
        status: 'OPEN',
      }),
    );
    const order7 = await this.orderRepo.save(
      this.orderRepo.create({
        user: bob,
        type: 'SELL',
        cryptoCurrency: eth,
        fiatCurrency: usd,
        price: '2700',
        amount: '1.5',
        status: 'CLOSED',
      }),
    );
    const order8 = await this.orderRepo.save(
      this.orderRepo.create({
        user: diana,
        type: 'BUY',
        cryptoCurrency: eth,
        fiatCurrency: thb,
        price: '98000',
        amount: '5',
        status: 'OPEN',
      }),
    );

    // ---------- Trades (จับคู่ order กับ buyer/seller หลายรายการ) ----------
    const trade1 = await this.tradeRepo.save(
      this.tradeRepo.create({
        order: order1,
        buyer: bob,
        seller: alice,
        crypto_amount: '0.2',
        fiat_amount: '400000',
        status: 'COMPLETED',
      }),
    );
    const trade2 = await this.tradeRepo.save(
      this.tradeRepo.create({
        order: order1,
        buyer: charlie,
        seller: alice,
        crypto_amount: '0.15',
        fiat_amount: '300000',
        status: 'PENDING',
      }),
    );
    const trade3 = await this.tradeRepo.save(
      this.tradeRepo.create({
        order: order3,
        buyer: diana,
        seller: charlie,
        crypto_amount: '1',
        fiat_amount: '95000',
        status: 'PENDING',
      }),
    );
    const trade4 = await this.tradeRepo.save(
      this.tradeRepo.create({
        order: order4,
        buyer: eve,
        seller: diana,
        crypto_amount: '0.5',
        fiat_amount: '29000',
        status: 'COMPLETED',
      }),
    );
    const trade5 = await this.tradeRepo.save(
      this.tradeRepo.create({
        order: order7,
        buyer: charlie,
        seller: bob,
        crypto_amount: '0.8',
        fiat_amount: '2160',
        status: 'COMPLETED',
      }),
    );

    // ---------- Escrows (ผูกกับ trade ที่มี) ----------
    await this.escrowRepo.save(
      this.escrowRepo.create({
        trade: trade1,
        amount_locked: '0.2',
        status: 'RELEASED',
      }),
    );
    await this.escrowRepo.save(
      this.escrowRepo.create({
        trade: trade2,
        amount_locked: '0.15',
        status: 'LOCKED',
      }),
    );
    await this.escrowRepo.save(
      this.escrowRepo.create({
        trade: trade3,
        amount_locked: '1',
        status: 'LOCKED',
      }),
    );
    await this.escrowRepo.save(
      this.escrowRepo.create({
        trade: trade4,
        amount_locked: '0.5',
        status: 'RELEASED',
      }),
    );
    await this.escrowRepo.save(
      this.escrowRepo.create({
        trade: trade5,
        amount_locked: '0.8',
        status: 'RELEASED',
      }),
    );

    // ---------- Transfers (โอนภายในและภายนอก หลายรายการ) ----------
    const transfersData: Array<{
      fromUser: User;
      toUser: User | null;
      currency: Currency;
      amount: string;
      type: 'INTERNAL' | 'EXTERNAL';
      externalAddress?: string;
    }> = [
      { fromUser: bob, toUser: alice, currency: btc, amount: '0.1', type: 'INTERNAL' },
      { fromUser: alice, toUser: null, currency: btc, amount: '0.05', type: 'EXTERNAL', externalAddress: 'bc1qalice-withdraw-001' },
      { fromUser: charlie, toUser: diana, currency: eth, amount: '0.5', type: 'INTERNAL' },
      { fromUser: diana, toUser: eve, currency: btc, amount: '0.08', type: 'INTERNAL' },
      { fromUser: eve, toUser: alice, currency: xrp, amount: '500', type: 'INTERNAL' },
      { fromUser: alice, toUser: bob, currency: doge, amount: '1000', type: 'INTERNAL' },
      { fromUser: bob, toUser: null, currency: eth, amount: '0.2', type: 'EXTERNAL', externalAddress: '0xbob-external-wallet' },
      { fromUser: diana, toUser: null, currency: btc, amount: '0.1', type: 'EXTERNAL', externalAddress: 'bc1qdiana-cold-002' },
      { fromUser: charlie, toUser: eve, currency: xrp, amount: '200', type: 'INTERNAL' },
      { fromUser: eve, toUser: charlie, currency: eth, amount: '0.3', type: 'INTERNAL' },
    ];

    for (const t of transfersData) {
      await this.transferRepo.save(
        this.transferRepo.create({
          fromUser: t.fromUser,
          toUser: t.toUser,
          currency: t.currency,
          amount: t.amount,
          type: t.type,
          external_address: t.externalAddress ?? null,
        }),
      );
    }

    console.log(
      '[Seed] First run: database seeded successfully. (5 users, 22 wallets, 8 orders, 5 trades, 5 escrows, 10 transfers)',
    );
  }
}
