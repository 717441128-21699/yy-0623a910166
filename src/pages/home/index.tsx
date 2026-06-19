import React, { useState, useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import GameCard from '@/components/GameCard';
import EmptyState from '@/components/EmptyState';
import { useGameContext } from '@/context/GameContext';
import { TabKey } from '@/types/game';

const HomePage: React.FC = () => {
  const { games, getRecruitingGames, getTodayGames } = useGameContext();
  const [activeTab, setActiveTab] = useState<TabKey>('recruiting');

  const handleCreate = () => {
    Taro.navigateTo({
      url: '/pages/createGame/index'
    });
  };

  const gamesList = useMemo(() => {
    switch (activeTab) {
      case 'recruiting':
        return getRecruitingGames();
      case 'today':
        return getTodayGames();
      case 'all':
        return games;
      default:
        return [];
    }
  }, [activeTab, games, getRecruitingGames, getTodayGames]);

  const recruitingCount = getRecruitingGames().length;
  const todayCount = getTodayGames().length;

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <View className={styles.headerTop}>
          <Text className={styles.title}>剧本站</Text>
          <View className={styles.createBtn} onClick={handleCreate}>
            <Text>+ 创建车队</Text>
          </View>
        </View>
        <View className={styles.stats}>
          <View className={styles.statItem}>
            <Text className={styles.number}>{recruitingCount}</Text>
            <Text className={styles.label}>招募中</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.number}>{todayCount}</Text>
            <Text className={styles.label}>今日场次</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.number}>{games.length}</Text>
            <Text className={styles.label}>全部车队</Text>
          </View>
        </View>
      </View>

      <View className={styles.tabs}>
        <View 
          className={classnames(styles.tabItem, activeTab === 'recruiting' && styles.active)}
          onClick={() => setActiveTab('recruiting')}
        >
          <Text>招募中</Text>
        </View>
        <View 
          className={classnames(styles.tabItem, activeTab === 'today' && styles.active)}
          onClick={() => setActiveTab('today')}
        >
          <Text>今日场</Text>
        </View>
        <View 
          className={classnames(styles.tabItem, activeTab === 'all' && styles.active)}
          onClick={() => setActiveTab('all')}
        >
          <Text>全部</Text>
        </View>
      </View>

      <View className={styles.list}>
        {gamesList.length > 0 ? (
          gamesList.map(game => (
            <GameCard key={game.id} game={game} />
          ))
        ) : (
          <EmptyState 
            title="暂无车队"
            description="点击右上角创建新车队吧"
            icon="🎭"
          />
        )}
      </View>
    </View>
  );
};

export default HomePage;
