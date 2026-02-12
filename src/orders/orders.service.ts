import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { Currency } from '../entities/currency.entity';
import { User } from '../entities/user.entity';
import { Wallet } from '../entities/wallet.entity';

interface CreateOrderDto {
  userId: number;
  type: 'BUY' | 'SELL';
  cryptoCurrencyCode: string;
  fiatCurrencyCode: string;
  price: string;
  amount: string;
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(Currency)
    private readonly currenciesRepository: Repository<Currency>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Wallet)
    private readonly walletsRepository: Repository<Wallet>,
  ) {}

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    const user = await this.usersRepository.findOneBy({
      user_id: dto.userId,
    });
    const cryptoCurrency = await this.currenciesRepository.findOneBy({
      code: dto.cryptoCurrencyCode,
    });
    const fiatCurrency = await this.currenciesRepository.findOneBy({
      code: dto.fiatCurrencyCode,
    });

    if (!user || !cryptoCurrency || !fiatCurrency) {
      throw new Error('Invalid user or currency');
    }

    if (dto.type === 'SELL') {
      let wallet = await this.walletsRepository.findOne({
        where: {
          user: { user_id: user.user_id },
          currency: { currency_id: cryptoCurrency.currency_id },
        },
        relations: ['user', 'currency'],
      });
      if (!wallet) {
        wallet = this.walletsRepository.create({
          user,
          currency: cryptoCurrency,
          balance: '0',
          locked_balance: '0',
        });
      }
      const amountNum = Number(dto.amount);
      const balanceNum = Number(wallet.balance);
      const lockedNum = Number(wallet.locked_balance);
      const available = balanceNum - lockedNum;
      if (available < amountNum) {
        throw new Error(
          `Insufficient balance to create SELL order (available: ${available}, order amount: ${amountNum})`,
        );
      }
      wallet.locked_balance = (lockedNum + amountNum).toFixed(8);
      await this.walletsRepository.save(wallet);
    }

    const order = this.ordersRepository.create({
      user,
      type: dto.type,
      cryptoCurrency,
      fiatCurrency,
      price: dto.price,
      amount: dto.amount,
      status: 'OPEN',
    });
    return this.ordersRepository.save(order);
  }

  async listOpenOrders(
    cryptoCode?: string,
    fiatCode?: string,
    type?: 'BUY' | 'SELL',
  ): Promise<Order[]> {
    const qb = this.ordersRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.cryptoCurrency', 'cryptoCurrency')
      .leftJoinAndSelect('order.fiatCurrency', 'fiatCurrency')
      .leftJoinAndSelect('order.user', 'user')
      .where('order.status = :status', { status: 'OPEN' });

    if (cryptoCode) {
      qb.andWhere('cryptoCurrency.code = :cryptoCode', { cryptoCode });
    }

    if (fiatCode) {
      qb.andWhere('fiatCurrency.code = :fiatCode', { fiatCode });
    }

    if (type) {
      qb.andWhere('order.type = :type', { type });
    }

    return qb.getMany();
  }
}

