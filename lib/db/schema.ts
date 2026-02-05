import { pgTable, text, timestamp, uuid, numeric } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const wallets = pgTable('wallets', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  balance: numeric('balance', { precision: 20, scale: 2 }).notNull().default('10000.00'),
  currency: text('currency').notNull().default('USD'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const portfolios = pgTable('portfolios', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  symbol: text('symbol').notNull(), // e.g., 'BTC', 'ETH'
  coinId: text('coin_id').notNull(), // CoinGecko ID
  amount: numeric('amount', { precision: 20, scale: 8 }).notNull(),
  averageBuyPrice: numeric('average_buy_price', { precision: 20, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const transactions = pgTable('transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'BUY' or 'SELL'
  symbol: text('symbol').notNull(),
  coinId: text('coin_id').notNull(),
  amount: numeric('amount', { precision: 20, scale: 8 }).notNull(),
  pricePerUnit: numeric('price_per_unit', { precision: 20, scale: 2 }).notNull(),
  totalValue: numeric('total_value', { precision: 20, scale: 2 }).notNull(),
  fee: numeric('fee', { precision: 20, scale: 2 }).notNull().default('0'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  portfolioId: uuid('portfolio_id').notNull().references(() => portfolios.id, { onDelete: 'cascade' }),
  symbol: text('symbol').notNull(),
  coinId: text('coin_id').notNull(),
  orderType: text('order_type').notNull(), // 'STOP_LOSS' or 'TAKE_PROFIT'
  triggerPrice: numeric('trigger_price', { precision: 20, scale: 2 }).notNull(),
  amount: numeric('amount', { precision: 20, scale: 8 }).notNull(),
  status: text('status').notNull().default('PENDING'), // 'PENDING', 'EXECUTED', 'CANCELLED'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  executedAt: timestamp('executed_at'),
});
