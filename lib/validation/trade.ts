import { z } from 'zod';

export const buyTradeSchema = z.object({
  coinId: z.string().min(1, 'Coin ID is required'),
  symbol: z.string().min(1, 'Symbol is required'),
  amount: z.number().positive('Amount must be positive'),
  pricePerUnit: z.number().positive('Price must be positive'),
});

export const sellTradeSchema = z.object({
  coinId: z.string().min(1, 'Coin ID is required'),
  symbol: z.string().min(1, 'Symbol is required'),
  amount: z.number().positive('Amount must be positive'),
  pricePerUnit: z.number().positive('Price must be positive'),
});

export const createOrderSchema = z.object({
  portfolioId: z.string().uuid('Invalid portfolio ID'),
  symbol: z.string().min(1, 'Symbol is required'),
  coinId: z.string().min(1, 'Coin ID is required'),
  orderType: z.enum(['STOP_LOSS', 'TAKE_PROFIT'], {
    message: 'Order type must be STOP_LOSS or TAKE_PROFIT',
  }),
  triggerPrice: z.number().positive('Trigger price must be positive'),
  amount: z.number().positive('Amount must be positive'),
});

export type BuyTradeInput = z.infer<typeof buyTradeSchema>;
export type SellTradeInput = z.infer<typeof sellTradeSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
