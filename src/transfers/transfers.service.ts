import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Transfer } from '../entities/transfer.entity';
import { User } from '../entities/user.entity';
import { Currency } from '../entities/currency.entity';
import { Wallet } from '../entities/wallet.entity';

interface CreateTransferDto {
  fromUserId: number;
  toUserId?: number;
  currencyCode: string;
  amount: string;
  type: 'INTERNAL' | 'EXTERNAL';
  externalAddress?: string;
}

@Injectable()
export class TransfersService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(Transfer)
    private readonly transfersRepository: Repository<Transfer>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Currency)
    private readonly currenciesRepository: Repository<Currency>,
    @InjectRepository(Wallet)
    private readonly walletsRepository: Repository<Wallet>,
  ) {}

  async createTransfer(dto: CreateTransferDto): Promise<Transfer> {
    return this.dataSource.transaction(async (manager) => {
      const fromUser = await manager.findOne(User, {
        where: { user_id: dto.fromUserId },
      });
      if (!fromUser) {
        throw new Error('Invalid from user');
      }

      let toUser: User | null = null;
      if (dto.toUserId) {
        toUser = await manager.findOne(User, {
          where: { user_id: dto.toUserId },
        });
      }

      const currency = await manager.findOne(Currency, {
        where: { code: dto.currencyCode },
      });
      if (!currency) {
        throw new Error('Invalid currency');
      }

      let fromWallet = await manager.findOne(Wallet, {
        where: {
          user: { user_id: fromUser.user_id },
          currency: { currency_id: currency.currency_id },
        },
        relations: ['user', 'currency'],
      });
      if (!fromWallet) {
        fromWallet = manager.create(Wallet, {
          user: fromUser,
          currency,
          balance: '0',
          locked_balance: '0',
        });
      }

      const amountNum = Number(dto.amount);
      const fromBalanceNum = Number(fromWallet.balance);
      const fromLockedNum = Number(fromWallet.locked_balance);
      const available = fromBalanceNum - fromLockedNum;

      if (available < amountNum) {
        throw new Error(
          `Insufficient balance (available: ${available}, required: ${amountNum})`,
        );
      }

      fromWallet.balance = (fromBalanceNum - amountNum).toFixed(8);
      await manager.save(Wallet, fromWallet);

      let toWallet: Wallet | null = null;
      if (dto.type === 'INTERNAL') {
        if (!toUser) {
          throw new Error('Invalid to user for INTERNAL transfer');
        }

        toWallet = await manager.findOne(Wallet, {
          where: {
            user: { user_id: toUser.user_id },
            currency: { currency_id: currency.currency_id },
          },
          relations: ['user', 'currency'],
        });
        if (!toWallet) {
          toWallet = manager.create(Wallet, {
            user: toUser,
            currency,
            balance: '0',
            locked_balance: '0',
          });
        }

        const toBalanceNum = Number(toWallet.balance);
        toWallet.balance = (toBalanceNum + amountNum).toFixed(8);
        await manager.save(Wallet, toWallet);
      }

      const transfer = manager.create(Transfer, {
        fromUser,
        toUser: dto.type === 'INTERNAL' ? toUser : null,
        currency,
        amount: dto.amount,
        type: dto.type,
        external_address:
          dto.type === 'EXTERNAL' ? dto.externalAddress ?? null : null,
      });

      return manager.save(Transfer, transfer);
    });
  }

  async listByUser(userId: number): Promise<Transfer[]> {
    return this.transfersRepository.find({
      where: [
        { fromUser: { user_id: userId } },
        { toUser: { user_id: userId } },
      ],
      relations: ['fromUser', 'toUser', 'currency'],
      order: { created_at: 'DESC' },
    });
  }
}

