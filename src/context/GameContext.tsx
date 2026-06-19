import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { Game, ApplyRecord, Player } from '@/types/game';
import { mockGames, mockPendingApplies, mockPlayers } from '@/data/mockData';

const STORAGE_GAMES = 'juben_games';
const STORAGE_APPLIES = 'juben_applies';
const STORAGE_CHECKED = 'juben_checked';

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

interface GameContextValue {
  games: Game[];
  applies: ApplyRecord[];
  checkedPlayerIds: string[];
  addGame: (game: Omit<Game, 'id' | 'players' | 'waitlist' | 'filledSeats' | 'status' | 'cover'>) => Game;
  addApply: (apply: Omit<ApplyRecord, 'id' | 'status' | 'applyTime' | 'depositPaid' | 'checkedIn'>) => void;
  approveApply: (applyId: string) => void;
  rejectApply: (applyId: string) => void;
  checkIn: (playerId: string) => void;
  promoteFromWaitlist: (gameId: string, playerId: string) => void;
  getGame: (gameId: string) => Game | undefined;
  getApply: (applyId: string) => ApplyRecord | undefined;
  getPendingApplies: () => ApplyRecord[];
  getTodayGames: () => Game[];
  getRecruitingGames: () => Game[];
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

  const addGame = useCallback((input: Omit<Game, 'id' | 'players' | 'waitlist' | 'filledSeats' | 'status' | 'cover'>): Game => {
    const newGame: Game = {
      ...input,
      id: nextId('g'),
      cover: defaultCovers[Math.floor(Math.random() * defaultCovers.length)],
      players: [],
      waitlist: [],
      filledSeats: 0,
      status: 'recruiting'
    };
    setGames(prev => [newGame, ...prev]);
    return newGame;
  }, []);

  const addApply = useCallback((input: Omit<ApplyRecord, 'id' | 'status' | 'applyTime' | 'depositPaid' | 'checkedIn'>) => {
    const newApply: ApplyRecord = {
      ...input,
      id: nextId('a'),
      status: 'pending',
      applyTime: new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      depositPaid: false,
      checkedIn: false
    };
    setApplies(prev => [...prev, newApply]);

    setGames(prev => prev.map(g => {
      if (g.id !== input.gameId) return g;
      const remaining = g.totalSeats - g.filledSeats;
      if (remaining > 0) {
        return { ...g, filledSeats: g.filledSeats + 1 };
      }
      return g;
    }));
  }, []);

  const approveApply = useCallback((applyId: string) => {
    setApplies(prev => prev.map(a =>
      a.id === applyId ? { ...a, status: 'approved' as const } : a
    ));

    const targetApply = applies.find(a => a.id === applyId);
    if (!targetApply) return;

    setGames(prev => prev.map(g => {
      if (g.id !== targetApply.gameId) return g;
      const alreadyIn = g.players.some(p => p.id === targetApply.player.id);
      if (alreadyIn) return g;
      const newPlayers = [...g.players, targetApply.player];
      const newFilled = newPlayers.length;
      const newStatus: Game['status'] = newFilled >= g.totalSeats ? 'full' : 'recruiting';
      return { ...g, players: newPlayers, filledSeats: newFilled, status: newStatus };
    }));
  }, [applies]);

  const rejectApply = useCallback((applyId: string) => {
    setApplies(prev => prev.map(a =>
      a.id === applyId ? { ...a, status: 'rejected' as const } : a
    ));

    const targetApply = applies.find(a => a.id === applyId);
    if (!targetApply) return;

    setGames(prev => prev.map(g => {
      if (g.id !== targetApply.gameId) return g;
      const wasOnlyPending = g.filledSeats > g.players.length;
      if (wasOnlyPending) {
        const newFilled = Math.max(g.players.length, g.filledSeats - 1);
        return { ...g, filledSeats: newFilled };
      }
      return g;
    }));
  }, [applies]);

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
      return {
        ...g,
        players: [...g.players, player],
        waitlist: g.waitlist.filter(p => p.id !== playerId),
        filledSeats: g.filledSeats + 1,
        status: (g.players.length + 1) >= g.totalSeats ? 'full' : g.status
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

  const value: GameContextValue = {
    games,
    applies,
    checkedPlayerIds,
    addGame,
    addApply,
    approveApply,
    rejectApply,
    checkIn,
    promoteFromWaitlist,
    getGame,
    getApply,
    getPendingApplies,
    getTodayGames,
    getRecruitingGames
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};
