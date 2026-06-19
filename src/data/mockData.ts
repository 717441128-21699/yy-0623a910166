import { Game, Player, ApplyRecord, ReviewItem } from '@/types/game';

export const mockPlayers: Player[] = [
  {
    id: 'p1',
    name: '林深见鹿',
    avatar: 'https://picsum.photos/id/64/200/200',
    tags: ['硬核玩家', '情感本爱好者', '不跳车'],
    gender: 'male',
    experience: 'veteran'
  },
  {
    id: 'p2',
    name: '月下星稀',
    avatar: 'https://picsum.photos/id/91/200/200',
    tags: ['新手', '推理小白', '女生'],
    gender: 'female',
    experience: 'newbie'
  },
  {
    id: 'p3',
    name: '北风卷地',
    avatar: 'https://picsum.photos/id/177/200/200',
    tags: ['推土机', '硬核本专业', '拼场常客'],
    gender: 'male',
    experience: 'veteran'
  },
  {
    id: 'p4',
    name: '南鸢离梦',
    avatar: 'https://picsum.photos/id/338/200/200',
    tags: ['情感喷泉', '哭本玩家', '老玩家'],
    gender: 'female',
    experience: 'normal'
  },
  {
    id: 'p5',
    name: '墨染青衣',
    avatar: 'https://picsum.photos/id/1027/200/200',
    tags: ['欢乐本', '戏精', '新手友好'],
    gender: 'male',
    experience: 'normal'
  },
  {
    id: 'p6',
    name: '清风徐来',
    avatar: 'https://picsum.photos/id/1025/200/200',
    tags: ['硬核', '密室玩家', '不反串'],
    gender: 'female',
    experience: 'veteran'
  }
];

export const mockGames: Game[] = [
  {
    id: 'g1',
    name: '浮云万里青鸟迟',
    cover: 'https://picsum.photos/id/1015/750/500',
    city: '上海',
    type: 'city',
    date: '2024-06-22',
    time: '14:00',
    dm: 'DM.子规',
    duration: 6,
    price: 228,
    totalSeats: 6,
    filledSeats: 4,
    playerConfig: '3男3女',
    warnings: '情感沉浸本，需代入角色。有亲情线、爱情线，不适合菠萝头玩家。',
    acceptNewbie: true,
    needAcquaintance: false,
    status: 'recruiting',
    players: [mockPlayers[0], mockPlayers[1], mockPlayers[3], mockPlayers[4]],
    waitlist: [mockPlayers[2]],
    address: '上海市静安区南京西路1266号恒隆广场2楼',
    depositAmount: 50,
    tags: ['城限', '情感', '民国', '沉浸']
  },
  {
    id: 'g2',
    name: '死囚·失控伦敦',
    cover: 'https://picsum.photos/id/1018/750/500',
    city: '上海',
    type: 'limited',
    date: '2024-06-20',
    time: '13:30',
    dm: 'DM.南城',
    duration: 8,
    price: 298,
    totalSeats: 6,
    filledSeats: 6,
    playerConfig: '3男3女',
    warnings: '硬核推理本，时长较长，需充足体力。有密室元素，新手慎入。',
    acceptNewbie: false,
    needAcquaintance: false,
    status: 'full',
    players: [mockPlayers[0], mockPlayers[2], mockPlayers[3], mockPlayers[4], mockPlayers[5], mockPlayers[1]],
    waitlist: [],
    address: '上海市静安区南京西路1266号恒隆广场2楼',
    depositAmount: 100,
    tags: ['独家', '硬核', '推理', '悬疑']
  },
  {
    id: 'g3',
    name: '燃烧',
    cover: 'https://picsum.photos/id/1036/750/500',
    city: '上海',
    type: 'city',
    date: '2024-06-21',
    time: '19:00',
    dm: 'DM.月色',
    duration: 5,
    price: 198,
    totalSeats: 6,
    filledSeats: 2,
    playerConfig: '3男3女',
    warnings: '消防题材情感本，有热血有感动。适合喜欢正能量题材的玩家。',
    acceptNewbie: true,
    needAcquaintance: false,
    status: 'recruiting',
    players: [mockPlayers[1], mockPlayers[4]],
    waitlist: [],
    address: '上海市静安区南京西路1266号恒隆广场2楼',
    depositAmount: 50,
    tags: ['城限', '情感', '立意', '现代']
  },
  {
    id: 'g4',
    name: '雾起云浮',
    cover: 'https://picsum.photos/id/1039/750/500',
    city: '上海',
    type: 'limited',
    date: '2024-06-20',
    time: '10:00',
    dm: 'DM.清风',
    duration: 7,
    price: 268,
    totalSeats: 5,
    filledSeats: 5,
    playerConfig: '3男2女',
    warnings: '豪门惊情系列，硬核推理。细节控必玩，不适合新手。',
    acceptNewbie: false,
    needAcquaintance: true,
    status: 'ongoing',
    players: [mockPlayers[0], mockPlayers[2], mockPlayers[3], mockPlayers[5], mockPlayers[4]],
    waitlist: [],
    address: '上海市静安区南京西路1266号恒隆广场2楼',
    depositAmount: 80,
    tags: ['独家', '硬核', '豪门', '推理']
  },
  {
    id: 'g5',
    name: '红豆',
    cover: 'https://picsum.photos/id/1044/750/500',
    city: '上海',
    type: 'city',
    date: '2024-06-23',
    time: '14:30',
    dm: 'DM.子规',
    duration: 5.5,
    price: 218,
    totalSeats: 6,
    filledSeats: 3,
    playerConfig: '3男3女',
    warnings: '民国情感本，有家国情怀。适合情感玩家，菠萝头慎入。',
    acceptNewbie: true,
    needAcquaintance: false,
    status: 'recruiting',
    players: [mockPlayers[1], mockPlayers[3], mockPlayers[4]],
    waitlist: [mockPlayers[0], mockPlayers[2]],
    address: '上海市静安区南京西路1266号恒隆广场2楼',
    depositAmount: 50,
    tags: ['城限', '情感', '民国', '家国']
  }
];

export const mockPendingApplies: ApplyRecord[] = [
  {
    id: 'a1',
    gameId: 'g1',
    player: mockPlayers[2],
    rolePreference: '男性角色',
    seatPreference: '随便',
    message: '老玩家，不跳车，准时到。求通过！',
    status: 'pending',
    applyTime: '2024-06-19 15:30',
    depositPaid: false,
    checkedIn: false
  },
  {
    id: 'a2',
    gameId: 'g1',
    player: mockPlayers[5],
    rolePreference: '女性角色都行',
    seatPreference: '靠边坐',
    message: '情感本老玩家，哭点低，好代入。',
    status: 'pending',
    applyTime: '2024-06-19 16:20',
    depositPaid: false,
    checkedIn: false
  },
  {
    id: 'a3',
    gameId: 'g3',
    player: mockPlayers[0],
    rolePreference: '男主',
    seatPreference: '中间位置',
    message: '经常来你们店，老顾客了，给个好角色呗~',
    status: 'pending',
    applyTime: '2024-06-19 18:45',
    depositPaid: false,
    checkedIn: false
  },
  {
    id: 'a4',
    gameId: 'g5',
    player: mockPlayers[2],
    rolePreference: '都可以',
    seatPreference: '随便',
    message: '硬核玩家也想打情感本试试，不跳车。',
    status: 'pending',
    applyTime: '2024-06-20 09:10',
    depositPaid: false,
    checkedIn: false
  }
];

export const getReviewItems = (): ReviewItem[] => {
  return mockPendingApplies.map(apply => ({
    apply,
    game: mockGames.find(g => g.id === apply.gameId)!
  }));
};

export const getTodayGames = (): Game[] => {
  return mockGames.filter(g => g.date === '2024-06-20');
};

export const getRecruitingGames = (): Game[] => {
  return mockGames.filter(g => g.status === 'recruiting');
};
