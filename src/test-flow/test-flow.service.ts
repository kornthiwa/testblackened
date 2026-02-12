import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { OrdersService } from '../orders/orders.service';
import { TransfersService } from '../transfers/transfers.service';

export interface TestFlowResult {
  ok: boolean;
  message: string;
  amountsThisRun: {
    step2_orderLock: string;
    step3_internalAmount: string;
    step4_externalAmount: string;
  };
  steps: {
    step1_getUsers: { userIds: number[]; count: number };
    step2_createOrder: { orderId: number; type: string; amount: string } | null;
    step3_transferInternal: {
      transferId: number;
      from: number;
      to: number;
      amount: string;
    } | null;
    step4_transferExternal: {
      transferId: number;
      from: number;
      amount: string;
      address: string;
    } | null;
    step5_userWithRelations: Record<string, unknown> | null;
  };
  summary: string;
}

@Injectable()
export class TestFlowService {
  constructor(
    private readonly usersService: UsersService,
    private readonly ordersService: OrdersService,
    private readonly transfersService: TransfersService,
  ) {}

  /**
   * รัน flow การทดสอบทั้งหมดในเส้นเดียว:
   * 1) ดึง users
   * 2) สร้าง order (SELL)
   * 3) โอนภายในระบบ (INTERNAL)
   * 4) โอนออกนอกระบบ (EXTERNAL)
   * 5) ดึง user พร้อม relations
   */
  async runFullFlow(): Promise<TestFlowResult> {
    const amountsThisRun = {
      step2_orderLock: '0.2',
      step3_internalAmount: '0.05',
      step4_externalAmount: '0.02',
    };

    const steps: TestFlowResult['steps'] = {
      step1_getUsers: { userIds: [], count: 0 },
      step2_createOrder: null,
      step3_transferInternal: null,
      step4_transferExternal: null,
      step5_userWithRelations: null,
    };

    try {
      // Step 1: ดึง users เรียงตาม user_id ให้ลำดับคงที่ (ต้องมีอย่างน้อย 2 คน จาก seed)
      const usersRaw = await this.usersService.findAll();
      const users = usersRaw.slice().sort((a, b) => a.user_id - b.user_id);
      steps.step1_getUsers = {
        userIds: users.map((u) => u.user_id),
        count: users.length,
      };

      if (users.length < 2) {
        return {
          ok: false,
          message: 'รัน npm run seed ก่อน เพื่อให้มี users อย่างน้อย 2 คน',
          amountsThisRun,
          steps,
          summary: 'Flow ไม่สมบูรณ์: ข้อมูล user ไม่พอ',
        };
      }

      const [user1, user2] = users;

      // Step 2: สร้าง order (user 1 ประกาศขาย BTC/THB)
      const order = await this.ordersService.createOrder({
        userId: user1.user_id,
        type: 'SELL',
        cryptoCurrencyCode: 'BTC',
        fiatCurrencyCode: 'THB',
        price: '2100000',
        amount: '0.2',
      });
      steps.step2_createOrder = {
        orderId: order.order_id,
        type: order.type,
        amount: order.amount,
      };

      // Step 3: โอนภายในระบบ (user 2 โอน BTC ให้ user 1)
      const transferInternal = await this.transfersService.createTransfer({
        fromUserId: user2.user_id,
        toUserId: user1.user_id,
        currencyCode: 'BTC',
        amount: '0.05',
        type: 'INTERNAL',
      });
      steps.step3_transferInternal = {
        transferId: transferInternal.transfer_id,
        from: user2.user_id,
        to: user1.user_id,
        amount: transferInternal.amount,
      };

      // Step 4: โอนออกนอกระบบ (user 1 ถอน BTC ไปที่อยู่ภายนอก)
      const transferExternal = await this.transfersService.createTransfer({
        fromUserId: user1.user_id,
        currencyCode: 'BTC',
        amount: '0.02',
        type: 'EXTERNAL',
        externalAddress: 'bc1qtestflowexternal123',
      });
      steps.step4_transferExternal = {
        transferId: transferExternal.transfer_id,
        from: user1.user_id,
        amount: transferExternal.amount,
        address: transferExternal.external_address ?? '',
      };

      // Step 5: ดึง user พร้อมความสัมพันธ์ และ balance จริงหลังโอน (สถานะล่าสุดจาก DB)
      const userWithRelations = await this.usersService.findUserWithRelations(
        user1.user_id,
      );
      steps.step5_userWithRelations = userWithRelations
        ? {
            user_id: userWithRelations.user_id,
            email: userWithRelations.email,
            status: userWithRelations.status,
            walletsCount: userWithRelations.wallets?.length ?? 0,
            ordersCount: userWithRelations.orders?.length ?? 0,
            buyTradesCount: userWithRelations.buyTrades?.length ?? 0,
            sellTradesCount: userWithRelations.sellTrades?.length ?? 0,
            wallets: userWithRelations.wallets?.map((w) => {
              const raw = w as {
                currency?: { code: string };
                balance: string | number;
                locked_balance: string | number;
              };
              return {
                currency: raw.currency?.code,
                balance:
                  typeof raw.balance === 'string'
                    ? raw.balance
                    : String(raw.balance),
                locked_balance:
                  typeof raw.locked_balance === 'string'
                    ? raw.locked_balance
                    : String(raw.locked_balance),
              };
            }),
          }
        : null;

      return {
        ok: true,
        message: 'รัน flow การทดสอบครบทุกขั้น',
        amountsThisRun,
        steps,
        summary: `Users: ${steps.step1_getUsers.count} | Order #${steps.step2_createOrder.orderId} (lock ${amountsThisRun.step2_orderLock} BTC) | Internal +${amountsThisRun.step3_internalAmount} → User1 | External -${amountsThisRun.step4_externalAmount} | Wallets ด้านล่างเป็นยอดจริงจาก DB (string)`,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        ok: false,
        message: `Flow error: ${message}`,
        amountsThisRun,
        steps,
        summary: 'Flow หยุดกลางคัน',
      };
    }
  }
}
