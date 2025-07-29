export interface DemoUser {
  id: string;
  username: string;
  display_name: string;
  role: string;
  wallet_balance: number;
  created_at: string;
}

export interface Movie {
  id: string;
  symbol: string;
  title: string;
  total_supply: number;
  market_price: number;
  description?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  movie_id: string;
  order_type: 'buy' | 'sell';
  price: number;
  quantity: number;
  filled_quantity: number;
  status: 'open' | 'filled' | 'cancelled';
  created_at: string;
}

export interface Trade {
  id: string;
  buyer_id: string;
  seller_id: string;
  movie_id: string;
  buy_order_id?: string;
  sell_order_id?: string;
  price: number;
  quantity: number;
  executed_at: string;
}

export interface Portfolio {
  id: string;
  user_id: string;
  movie_id: string;
  quantity: number;
  average_price: number;
  updated_at: string;
}