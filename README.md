# C2C Cryptocurrencies Exchange

Backend ระบบตัวกลางแลกเปลี่ยน Cryptocurrencies แบบ C2C (Customer-to-Customer) ใช้ NestJS + TypeORM + SQLite รองรับการตั้ง order ซื้อ/ขาย (BTC, ETH, XRP, DOGE กับ THB, USD) การจับคู่ trade และการโอนภายในระบบ/ออกนอกระบบ

---

## หลักการออกแบบ

### ภาพรวมระบบ

ระบบออกแบบให้เป็น **ตัวกลาง (marketplace)** ไม่ได้เป็น exchange แบบ order book แบบรวมศูนย์: ผู้ใช้สร้าง **order ประกาศซื้อหรือขาย** แล้วระบบบันทึกการจับคู่เป็น **trade** ระหว่าง buyer กับ seller แต่ละรายการ โครงสร้างคล้ายแนวคิด [C2C ของ Binance](https://c2c.binance.com/th/trade/buy/BTC): ใช้ Fiat (THB, USD) ซื้อ/ขาย crypto กับ User อื่นในระบบ และรองรับการโอนเหรียญระหว่าง User (internal) หรือโอนออกไปที่อยู่ภายนอก (external)

### โครงสร้างฐานข้อมูล

ออกแบบเป็น 7 เอนทิตีหลัก แยกหน้าที่ชัดเจน:

| เอนทิตี | บทบาทในการออกแบบ |
|--------|---------------------|
| **users** | บัญชีผู้ใช้ หนึ่งคนมีหลาย wallet, หลาย order, เป็นได้ทั้ง buyer/seller ใน trade และต้นทาง/ปลายทางใน transfer |
| **currencies** | รายการสกุลเงิน (CRYPTO: BTC, ETH, XRP, DOGE / FIAT: THB, USD) ใช้ร่วมใน wallet, order และ transfer ไม่เก็บยอดในตารางนี้ |
| **wallets** | กระเป๋าเงินต่อ user ต่อ currency หนึ่งคู่ (user_id + currency_id) เก็บ balance และ locked_balance เพื่อรองรับการล็อคยอดระหว่างทำ trade |
| **orders** | ประกาศซื้อหรือขาย (BUY/SELL) ระบุคู่ crypto–fiat, ราคา, จำนวน และ status (OPEN/CLOSED/CANCELLED) หนึ่ง order อาจถูกจับคู่หลายครั้งเป็นหลาย trade |
| **trades** | รายการที่จับคู่แล้ว หนึ่ง trade ต่อหนึ่ง order มี buyer กับ seller ชัดเจน เก็บจำนวน crypto และ fiat ที่แลกกัน และ status (PENDING/COMPLETED) |
| **escrows** | ล็อคเงินระหว่างทำธุรกรรม ผูกหนึ่งต่อหนึ่งกับ trade เก็บ amount_locked และ status (LOCKED/RELEASED) เพื่อใช้ใน flow จริงเมื่อมีการยืนยันการโอน |
| **transfers** | บันทึกการโอน: โอนภายในระบบ (from_user → to_user, type INTERNAL) หรือโอนออก (type EXTERNAL, ระบุ external_address) ใช้ currency เดียวต่อหนึ่งรายการ |

ความสัมพันธ์หลัก: User 1:N Wallets, Orders, Trades (ในบทบาท buyer/seller), Transfers (outgoing/incoming). Order N:1 User, Crypto Currency, Fiat Currency; Order 1:N Trades. Trade 1:1 Escrow. Transfer N:1 From User, To User (nullable เมื่อ EXTERNAL), Currency.

### การทำงานจริงของระบบ (อัปเดต balance / สถานะ)

- **สร้าง Order แบบ SELL** — ระบบจะ **lock ยอด crypto** ใน wallet ของผู้ขาย (`locked_balance` += amount) และตรวจสอบยอดใช้ได้ (balance - locked_balance) ก่อนสร้าง order สถานะ `OPEN`
- **การโอน (Transfer)** — ทุกการโอนทำงานใน **transaction** เดียว:
  - ใช้ยอด **available** = `balance - locked_balance` ในการตรวจสอบก่อนหัก
  - **INTERNAL**: หักจาก wallet ผู้โอน → บวกเข้า wallet ผู้รับ (สร้าง wallet ให้อัตโนมัติถ้ายังไม่มี)
  - **EXTERNAL**: หักจาก wallet ผู้โอน ระบุ `externalAddress`
- **Test flow** (`GET /test/flow`) — รัน flow ครบ: สร้าง order (lock) → โอนภายใน → โอนออก → ดึง user + wallets; response มี `amountsThisRun` (จำนวนที่ใช้ในรอบนี้) และ `step5_userWithRelations.wallets` เป็นยอดจริงจาก DB (ส่งเป็น string)

### โครงสร้างโปรเจ็กต์

- **src/entities/** — TypeORM entities (user, currency, wallet, order, trade, escrow, transfer) กำหนดความสัมพันธ์และคอลัมน์
- **src/users/, src/orders/, src/transfers/** — Module + Service + Controller ของ User, Order, Transfer ตามโดเมน
- **src/seed/** — Seed ข้อมูลเริ่มต้น (รันอัตโนมัติเมื่อ DB ยังว่าง)
- **src/test-flow/** — Endpoint เทส flow ทั้งระบบในครั้งเดียว

---

## วิธีการใช้งาน

### 1. ติดตั้งและรัน

```bash
# ติดตั้ง dependencies
yarn install

# รันโหมด development (ครั้งแรกจะสร้าง cryptocurrencies.db และ seed ให้อัตโนมัติ)
yarn start:dev
```

Server จะรันที่ `http://localhost:3000`  
ถ้าต้องการ seed ใหม่: ลบไฟล์ `cryptocurrencies.db` แล้วรัน `yarn start:dev` อีกครั้ง

### 2. บัญชีผู้ใช้ (Users)

**สร้างบัญชี**

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"newuser@example.com\",\"password\":\"mypassword\"}"
```

**ดูรายชื่อผู้ใช้**

```bash
curl http://localhost:3000/users
```

**ดูผู้ใช้หนึ่งคนพร้อมความสัมพันธ์ (wallets, orders, buyTrades, sellTrades)**

```bash
curl http://localhost:3000/users/1
```

**ดู wallets ของ user**

```bash
curl http://localhost:3000/users/1/wallets
```

**ดู orders ของ user**

```bash
curl http://localhost:3000/users/1/orders
```

### 3. Order ซื้อ/ขาย (Orders)

Order แบบ **SELL** จะ lock ยอด crypto ใน wallet ของผู้ขาย (`locked_balance`) ทันทีที่สร้าง (ต้องมียอด available พอ)

**สร้าง order ประกาศขาย (เช่น ขาย BTC รับ THB)**

```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d "{\"userId\":1,\"type\":\"SELL\",\"cryptoCurrencyCode\":\"BTC\",\"fiatCurrencyCode\":\"THB\",\"price\":\"2000000\",\"amount\":\"0.5\"}"
```

**สร้าง order ประกาศซื้อ**

```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d "{\"userId\":2,\"type\":\"BUY\",\"cryptoCurrencyCode\":\"ETH\",\"fiatCurrencyCode\":\"THB\",\"price\":\"95000\",\"amount\":\"2\"}"
```

**ดู order ที่เปิดอยู่ (filter ได้)**

```bash
# ทั้งหมด
curl http://localhost:3000/orders

# เฉพาะ BTC/THB ประเภท SELL
curl "http://localhost:3000/orders?crypto=BTC&fiat=THB&type=SELL"
```

### 4. การโอน (Transfers)

การโอนจะ **หัก/บวก balance ใน wallet จริง** ภายใน transaction (ยอดที่ใช้ได้ = balance - locked_balance)

**โอนภายในระบบ (จาก user 2 ไป user 1)**

```bash
curl -X POST http://localhost:3000/transfers \
  -H "Content-Type: application/json" \
  -d "{\"fromUserId\":2,\"toUserId\":1,\"currencyCode\":\"BTC\",\"amount\":\"0.1\",\"type\":\"INTERNAL\"}"
```

**โอนออกนอกระบบ (ถอนไปที่อยู่ภายนอก)**

```bash
curl -X POST http://localhost:3000/transfers \
  -H "Content-Type: application/json" \
  -d "{\"fromUserId\":1,\"currencyCode\":\"BTC\",\"amount\":\"0.05\",\"type\":\"EXTERNAL\",\"externalAddress\":\"bc1qyour-external-address\"}"
```

**ดูประวัติโอนของ user (ทั้งที่ส่งและรับ)**

```bash
curl http://localhost:3000/transfers/user/1
```

### 5. เทส flow ทั้งระบบในเส้นเดียว

เรียก endpoint เดียวเพื่อรัน flow ที่ **โอนจริงและอัปเดต DB**: ดึง users (เรียง user_id) → สร้าง order SELL (lock 0.2 BTC) → โอนภายใน user2→user1 (0.05 BTC) → โอนออก user1 (0.02 BTC) → ดึง user1 พร้อม relations และยอด wallet ล่าสุด

```bash
curl http://localhost:3000/test/flow
```

หรือเปิดในเบราว์เซอร์: `http://localhost:3000/test/flow`

**Response ที่ได้:**

- `amountsThisRun` — จำนวนที่ flow นี้ใช้: `step2_orderLock`, `step3_internalAmount`, `step4_externalAmount`
- `steps.step5_userWithRelations.wallets` — ยอด `balance` / `locked_balance` จริงจาก DB (ส่งเป็น **string** เพื่อไม่ให้ค่าตกหล่น)
- รัน flow ซ้ำหลายครั้งยอดจะสะสมใน DB; ถ้าต้องการยอดเทียบหนึ่งรอบ ให้ seed ใหม่ (ลบ `cryptocurrencies.db` แล้วรัน `yarn start:dev`) แล้วรัน flow แค่ครั้งเดียว

---

## สรุป Endpoints

| Method | Path | ความหมาย |
|--------|------|-----------|
| POST | /users | สร้าง user |
| GET | /users | รายชื่อ users |
| GET | /users/:id | user + relations |
| GET | /users/:id/wallets | wallets ของ user |
| GET | /users/:id/orders | orders ของ user |
| POST | /orders | สร้าง order (BUY/SELL) |
| GET | /orders | list orders เปิดอยู่ (query: crypto, fiat, type) |
| POST | /transfers | สร้าง transfer (INTERNAL/EXTERNAL) |
| GET | /transfers/user/:id | ประวัติโอนของ user |
| GET | /test/flow | เทส flow ทั้งระบบ |

Base URL: `http://localhost:3000`
