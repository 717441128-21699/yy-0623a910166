import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import GameCard from '@/components/GameCard';
import EmptyState from '@/components/EmptyState';
import { mockGames, getRecruitingGames, getTodayGames } from '@/data/mockData';
import { TabKey } from '@/types/game';

const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('recruiting');

  const handleCreate = () => {
    Taro.navigateTo({
      url: '/pages/createGame/index'
    });
  };

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
  };

  const getGames = useCallback(() => {
    switch (activeTab) {
      case 'recruiting':
        return getRecruitingGames();
      case 'today':
        return getTodayGames();
      case 'all':
        return mockGames;
      default:
        return [];
    }
  }, [activeTab]);

  const games = getGames();
  const recruitingCount = getRecruitingGames().length;
  const todayCount = getTodayGames().length;

  const onPullDownRefresh = () => {
    setTimeout(() => {
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 1000);
  };

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
            <Text className={styles.number}>{mockGames.length}</Text>
            <Text className={styles.label}>全部车队</Text>
          </View>
        </View>
      </View>

      <View className={styles.tabs}>
        <View 
          className={classnames(styles.tabItem, activeTab === 'recruiting' && styles.active)}
          onClick={() => handleTabChange('recruiting')}
        >
          <Text>招募中</Text>
        </View>
        <View 
          className={classnames(styles.tabItem, activeTab === 'today' && styles.active)}
          onClick={() => handleTabChange('today')}
        >
          <Text>今日场</Text>
        </View>
        <View 
          className={classnames(styles.tabItem, activeTab === 'all' && styles.active)}
          onClick={() => handleTabChange('all')}
        >
          <Text>全部</Text>
        </View>
      </View>

      <View className={styles.list}>
        {games.length > 0 ? (
          games.map(game => (
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
