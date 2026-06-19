export interface Seat {
  number: number;
  label: string;
  playerId?: string;
  status: 'available' | 'reserved' | 'occupied' | 'waitlist';
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  tags: string[];
  gender: 'male' | 'female' | 'unknown';
  experience: 'newbie' | 'normal' | 'veteran';
  phone?: string;
  seatNumber?: number;
}

export interface ApplyRecord {
  id: string;
  gameId: string;
  player: Player;
  rolePreference: string;
  seatPreference: string;
  seatNumber?: number;
  message: string;
  status: 'pending' | 'approved' | 'rejected' | 'waitlist';
  applyTime: string;
  depositPaid: boolean;
  checkedIn: boolean;
  phone?: string;
}

export interface Game {
  id: string;
  name: string;
  cover: string;
  city: string;
  type: 'city' | 'limited' | 'normal';
  date: string;
  time: string;
  dm: string;
  duration: number;
  price: number;
  totalSeats: number;
  filledSeats: number;
  playerConfig: string;
  warnings: string;
  acceptNewbie: boolean;
  needAcquaintance: boolean;
  status: 'recruiting' | 'full' | 'ongoing' | 'finished';
  players: Player[];
  waitlist: Player[];
  address: string;
  depositAmount: number;
  tags: string[];
  seats: Seat[];
}

export type TabKey = 'recruiting' | 'today' | 'all';

export interface ReviewItem {
  apply: ApplyRecord;
  game: Game;
}

export type ApplyStatus = 'pending' | 'approved' | 'rejected' | 'waitlist' | 'all';
