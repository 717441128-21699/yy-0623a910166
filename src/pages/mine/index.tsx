import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useGameContext } from '@/context/GameContext';

const MinePage: React.FC = () => {
  const { games } = useGameContext();

  const menuItems = [
    { icon: '🏪', text: '门店设置', onClick: () => Taro.showToast({ title: '功能开发中', icon: 'none' }) },
    { icon: '👥', text: '玩家管理', onClick: () => Taro.showToast({ title: '功能开发中', icon: 'none' }) },
    { icon: '📊', text: '经营数据', onClick: () => Taro.showToast({ title: '功能开发中', icon: 'none' }) },
    { icon: '💬', text: '消息通知', onClick: () => Taro.showToast({ title: '功能开发中', icon: 'none' }) },
    { icon: '⚙️', text: '系统设置', onClick: () => Taro.showToast({ title: '功能开发中', icon: 'none' }) }
  ];

  const totalGames = games.length;
  const totalPlayers = games.reduce((sum, g) => sum + g.players.length, 0);
  const totalRevenue = games.reduce((sum, g) => sum + g.filledSeats * g.price, 0);

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <View className={styles.userInfo}>
          <Image 
            className={styles.avatar} 
            src="https://picsum.photos/id/1015/200/200" 
            mode="aspectFill"
          />
          <View className={styles.userDetail}>
            <Text className={styles.userName}>幻境推理社</Text>
            <Text className={styles.role}>门店店主</Text>
          </View>
        </View>
      </View>

      <View className={styles.statsCard}>
        <Text className={styles.statsTitle}>本月数据</Text>
        <View className={styles.statsGrid}>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{totalGames}</Text>
            <Text className={styles.statLabel}>开本场次</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{totalPlayers}</Text>
            <Text className={styles.statLabel}>服务玩家</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>¥{totalRevenue}</Text>
            <Text className={styles.statLabel}>营收</Text>
          </View>
        </View>
      </View>

      <Text className={styles.sectionTitle}>常用功能</Text>
      <View className={styles.listCard}>
        {menuItems.map((item, index) => (
          <View 
            key={index} 
            className={styles.menuItem}
            onClick={item.onClick}
          >
            <Text className={styles.menuIcon}>{item.icon}</Text>
            <Text className={styles.menuText}>{item.text}</Text>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default MinePage;
