import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import Taro from '@tarojs/taro';
import { Game, ApplyRecord, Player, Seat, ApplyStatus } from '@/types/game';
import { mockGames, mockPendingApplies } from '@/data/mockData';

const STORAGE_GAMES = 'juben_games_v2';
const STORAGE_APPLIES = 'juben_applies_v2';
const STORAGE_CHECKED = 'juben_checked_v2';

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const raw = Taro.getStorageSync(key);
    if (raw) return JSON.parse(raw as string) as T;
  } catch {}
  return fallback;
}

function saveStorage(key: string, data: any) {
  try {
    Taro.setStorageSync(key, JSON.stringify(data));
  } catch {}
}

function generateSeats(total: number): Seat[] {
  const seats: Seat[] = [];
  for (let i = 1; i <= total; i++) {
    seats.push({
      number: i,
      label: `${i}号`,
      status: 'available'
    });
  }
  return seats;
}

function buildSeatsFromPlayers(totalSeats: number, players: Player[], pendingSeatNumbers: number[]): Seat[] {
  const seats = generateSeats(totalSeats);
  players.forEach(player => {
    const seatNum = player.seatNumber;
    if (seatNum && seatNum >= 1 && seatNum <= totalSeats) {
      seats[seatNum - 1] = {
        ...seats[seatNum - 1],
        playerId: player.id,
        status: 'occupied'
      };
    }
  });
  pendingSeatNumbers.forEach(num => {
    if (num >= 1 && num <= totalSeats && seats[num - 1].status === 'available') {
      seats[num - 1] = {
        ...seats[num - 1],
        status: 'reserved'
      };
    }
  });
  return seats;
}

interface GameContextValue {
  games: Game[];
  applies: ApplyRecord[];
  checkedPlayerIds: string[];
  addGame: (game: Omit<Game, 'id' | 'players' | 'waitlist' | 'filledSeats' | 'status' | 'cover' | 'seats'>) => Game;
  addApply: (apply: Omit<ApplyRecord, 'id' | 'status' | 'applyTime' | 'depositPaid' | 'checkedIn'>) => void;
  approveApply: (applyId: string) => void;
  rejectApply: (applyId: string) => void;
  batchApprove: (applyIds: string[]) => void;
  batchReject: (applyIds: string[]) => void;
  checkIn: (playerId: string) => void;
  promoteFromWaitlist: (gameId: string, playerId: string) => void;
  getGame: (gameId: string) => Game | undefined;
  getApply: (applyId: string) => ApplyRecord | undefined;
  getPendingApplies: () => ApplyRecord[];
  getTodayGames: () => Game[];
  getRecruitingGames: () => Game[];
  getAppliesByGame: (gameId: string, status?: ApplyStatus) => ApplyRecord[];
  getUniqueDates: () => string[];
  getUniqueGames: () => { id: string; name: string; date: string }[];
}

const GameContext = createContext<GameContextValue | null>(null);

export const useGameContext = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGameContext must be used within GameProvider');
  return ctx;
};

const defaultCovers = [
  'https://picsum.photos/id/1015/750/500',
  'https://picsum.photos/id/1018/750/500',
  'https://picsum.photos/id/1036/750/500',
  'https://picsum.photos/id/1039/750/500',
  'https://picsum.photos/id/1044/750/500',
  'https://picsum.photos/id/1047/750/500',
  'https://picsum.photos/id/1057/750/500',
  'https://picsum.photos/id/1060/750/500'
];

let idCounter = Date.now();
function nextId(prefix: string) {
  return `${prefix}_${++idCounter}`;
}

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [games, setGames] = useState<Game[]>(() => loadStorage(STORAGE_GAMES, mockGames));
  const [applies, setApplies] = useState<ApplyRecord[]>(() => loadStorage(STORAGE_APPLIES, mockPendingApplies));
  const [checkedPlayerIds, setCheckedPlayerIds] = useState<string[]>(() => loadStorage(STORAGE_CHECKED, ['p1', 'p2']));

  useEffect(() => { saveStorage(STORAGE_GAMES, games); }, [games]);
  useEffect(() => { saveStorage(STORAGE_APPLIES, applies); }, [applies]);
  useEffect(() => { saveStorage(STORAGE_CHECKED, checkedPlayerIds); }, [checkedPlayerIds]);

  const rebuildGameSeats = useCallback((game: Game, allApplies: ApplyRecord[]): Game => {
    const pendingOfGame = allApplies.filter(a => a.gameId === game.id && a.status === 'pending' && a.seatNumber);
    const pendingSeatNums = pendingOfGame.map(a => a.seatNumber!).filter(Boolean);
    return {
      ...game,
      seats: buildSeatsFromPlayers(game.totalSeats, game.players, pendingSeatNums)
    };
  }, []);

  const addGame = useCallback((input: Omit<Game, 'id' | 'players' | 'waitlist' | 'filledSeats' | 'status' | 'cover' | 'seats'>): Game => {
    const newGame: Game = {
      ...input,
      id: nextId('g'),
      cover: defaultCovers[Math.floor(Math.random() * defaultCovers.length)],
      players: [],
      waitlist: [],
      filledSeats: 0,
      status: 'recruiting',
      seats: generateSeats(input.totalSeats)
    };
    setGames(prev => [newGame, ...prev]);
    return newGame;
  }, []);

  const addApply = useCallback((input: Omit<ApplyRecord, 'id' | 'status' | 'applyTime' | 'depositPaid' | 'checkedIn'>) => {
    const now = new Date();
    const applyTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const playerWithPhone: Player = {
      ...input.player,
      phone: input.phone || input.player.phone
    };

    const newApply: ApplyRecord = {
      ...input,
      player: playerWithPhone,
      id: nextId('a'),
      status: 'pending',
      applyTime,
      depositPaid: false,
      checkedIn: false,
      phone: input.phone || input.player.phone
    };

    setApplies(prev => [...prev, newApply]);

    setGames(prev => prev.map(g => {
      if (g.id !== input.gameId) return g;
      const remaining = g.totalSeats - g.filledSeats;
      if (remaining > 0) {
        const newFilled = g.filledSeats + 1;
        const newStatus: Game['status'] = newFilled >= g.totalSeats ? 'full' : 'recruiting';
        const updatedGame = { ...g, filledSeats: newFilled, status: newStatus };
        const allPending = [...applies, newApply].filter(a => a.gameId === g.id && a.status === 'pending' && a.seatNumber);
        const pendingSeatNums = allPending.map(a => a.seatNumber!).filter(Boolean);
        return {
          ...updatedGame,
          seats: buildSeatsFromPlayers(g.totalSeats, g.players, pendingSeatNums)
        };
      }
      return g;
    }));
  }, [applies]);

  const approveApply = useCallback((applyId: string) => {
    const targetApply = applies.find(a => a.id === applyId);
    if (!targetApply || targetApply.status !== 'pending') return;

    setApplies(prev => prev.map(a =>
      a.id === applyId ? { ...a, status: 'approved' as const } : a
    ));

    setGames(prev => prev.map(g => {
      if (g.id !== targetApply.gameId) return g;
      const alreadyIn = g.players.some(p => p.id === targetApply.player.id);
      if (alreadyIn) return g;

      const seatNum = targetApply.seatNumber;
      let assignedSeat = seatNum;
      if (!assignedSeat || assignedSeat < 1 || assignedSeat > g.totalSeats || g.players.some(p => p.seatNumber === assignedSeat)) {
        const availableIdx = g.seats.findIndex(s => s.status === 'available');
        assignedSeat = availableIdx >= 0 ? availableIdx + 1 : undefined;
      }

      const playerWithSeat: Player = {
        ...targetApply.player,
        phone: targetApply.phone || targetApply.player.phone,
        seatNumber: assignedSeat
      };

      const newPlayers = [...g.players, playerWithSeat];
      const remainingPending = applies.filter(a =>
        a.gameId === g.id && a.status === 'pending' && a.seatNumber && a.id !== applyId
      );
      const pendingSeatNums = remainingPending.map(a => a.seatNumber!).filter(Boolean);

      return {
        ...g,
        players: newPlayers,
        seats: buildSeatsFromPlayers(g.totalSeats, newPlayers, pendingSeatNums),
        status: newPlayers.length >= g.totalSeats ? 'full' : g.status
      };
    }));
  }, [applies]);

  const rejectApply = useCallback((applyId: string) => {
    const targetApply = applies.find(a => a.id === applyId);
    if (!targetApply || targetApply.status !== 'pending') return;

    setApplies(prev => prev.map(a =>
      a.id === applyId ? { ...a, status: 'rejected' as const } : a
    ));

    setGames(prev => prev.map(g => {
      if (g.id !== targetApply.gameId) return g;
      const wasFilled = g.status === 'full';
      const newFilled = Math.max(g.players.length, g.filledSeats - 1);
      const newStatus: Game['status'] = wasFilled && newFilled < g.totalSeats ? 'recruiting' : g.status;

      const remainingPending = applies.filter(a =>
        a.gameId === g.id && a.status === 'pending' && a.seatNumber && a.id !== applyId
      );
      const pendingSeatNums = remainingPending.map(a => a.seatNumber!).filter(Boolean);

      return {
        ...g,
        filledSeats: newFilled,
        status: newStatus,
        seats: buildSeatsFromPlayers(g.totalSeats, g.players, pendingSeatNums)
      };
    }));
  }, [applies]);

  const batchApprove = useCallback((applyIds: string[]) => {
    applyIds.forEach(id => {
      const target = applies.find(a => a.id === id);
      if (target && target.status === 'pending') {
        approveApply(id);
      }
    });
  }, [applies, approveApply]);

  const batchReject = useCallback((applyIds: string[]) => {
    applyIds.forEach(id => {
      const target = applies.find(a => a.id === id);
      if (target && target.status === 'pending') {
        rejectApply(id);
      }
    });
  }, [applies, rejectApply]);

  const checkIn = useCallback((playerId: string) => {
    setCheckedPlayerIds(prev => {
      if (prev.includes(playerId)) return prev;
      return [...prev, playerId];
    });
  }, []);

  const promoteFromWaitlist = useCallback((gameId: string, playerId: string) => {
    setGames(prev => prev.map(g => {
      if (g.id !== gameId) return g;
      const player = g.waitlist.find(p => p.id === playerId);
      if (!player) return g;
      const alreadyInPlayers = g.players.some(p => p.id === playerId);
      if (alreadyInPlayers) return g;

      const availableIdx = g.seats.findIndex(s => s.status === 'available');
      const assignedSeat = availableIdx >= 0 ? availableIdx + 1 : undefined;
      const playerWithSeat: Player = {
        ...player,
        seatNumber: assignedSeat
      };

      const newPlayers = [...g.players, playerWithSeat];
      const newWaitlist = g.waitlist.filter(p => p.id !== playerId);

      return {
        ...g,
        players: newPlayers,
        waitlist: newWaitlist,
        filledSeats: newPlayers.length,
        status: newPlayers.length >= g.totalSeats ? 'full' : g.status,
        seats: buildSeatsFromPlayers(g.totalSeats, newPlayers, [])
      };
    }));
  }, []);

  const getGame = useCallback((gameId: string) => {
    return games.find(g => g.id === gameId);
  }, [games]);

  const getApply = useCallback((applyId: string) => {
    return applies.find(a => a.id === applyId);
  }, [applies]);

  const getPendingApplies = useCallback(() => {
    return applies.filter(a => a.status === 'pending');
  }, [applies]);

  const getTodayGames = useCallback(() => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return games.filter(g => g.date === todayStr);
  }, [games]);

  const getRecruitingGames = useCallback(() => {
    return games.filter(g => g.status === 'recruiting');
  }, [games]);

  const getAppliesByGame = useCallback((gameId: string, status?: ApplyStatus) => {
    return applies.filter(a => {
      if (a.gameId !== gameId) return false;
      if (status && status !== 'all' && a.status !== status) return false;
      return true;
    });
  }, [applies]);

  const getUniqueDates = useMemo(() => {
    const dates = new Set(games.map(g => g.date));
    return Array.from(dates).sort();
  }, [games]);

  const getUniqueGames = useMemo(() => {
    return games.map(g => ({ id: g.id, name: g.name, date: g.date }));
  }, [games]);

  const value: GameContextValue = {
    games,
    applies,
    checkedPlayerIds,
    addGame,
    addApply,
    approveApply,
    rejectApply,
    batchApprove,
    batchReject,
    checkIn,
    promoteFromWaitlist,
    getGame,
    getApply,
    getPendingApplies,
    getTodayGames,
    getRecruitingGames,
    getAppliesByGame,
    getUniqueDates,
    getUniqueGames
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};
