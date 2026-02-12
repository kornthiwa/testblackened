import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Wallet } from '../entities/wallet.entity';
import { Order } from '../entities/order.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Wallet)
    private readonly walletsRepository: Repository<Wallet>,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
  ) {}

  async createUser(email: string, passwordHash: string): Promise<User> {
    const user = this.usersRepository.create({
      email,
      password_hash: passwordHash,
    });
    return this.usersRepository.save(user);
  }

  async findUserWithRelations(id: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { user_id: id },
      relations: [
        'wallets',
        'wallets.currency',
        'orders',
        'buyTrades',
        'sellTrades',
      ],
    });
  }

  async getUserWallets(id: number): Promise<Wallet[]> {
    return this.walletsRepository.find({
      where: { user: { user_id: id } },
      relations: ['currency'],
    });
  }

  async getUserOrders(id: number): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { user: { user_id: id } },
      relations: ['cryptoCurrency', 'fiatCurrency'],
    });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }
}
