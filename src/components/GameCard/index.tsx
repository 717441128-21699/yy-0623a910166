import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import StatusBadge from '@/components/StatusBadge';
import { Game } from '@/types/game';

interface GameCardProps {
  game: Game;
  onClick?: () => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      Taro.navigateTo({
        url: `/pages/gameDetail/index?id=${game.id}`
      });
    }
  };

  const remainingSeats = game.totalSeats - game.filledSeats;

  return (
    <View className={styles.card} onClick={handleClick}>
      <View className={styles.coverWrap}>
        <Image className={styles.cover} src={game.cover} mode="aspectFill" />
        <View className={styles.typeBadge}>
          <StatusBadge status={game.type} size="sm" />
        </View>
        <View className={styles.statusBadge}>
          <StatusBadge status={game.status} size="sm" />
        </View>
      </View>
      
      <View className={styles.content}>
        <View className={styles.header}>
          <Text className={styles.name}>{game.name}</Text>
          <View className={styles.tags}>
            {game.tags.slice(1, 3).map((tag, idx) => (
              <Text key={idx} className={styles.tag}>{tag}</Text>
            ))}
          </View>
        </View>
        
        <View className={styles.infoRow}>
          <Text className={styles.infoItem}>
            <Text className={styles.label}>日期</Text>
            <Text className={styles.value}>{game.date} {game.time}</Text>
          </Text>
        </View>
        
        <View className={styles.infoRow}>
          <Text className={styles.infoItem}>
            <Text className={styles.label}>DM</Text>
            <Text className={styles.value}>{game.dm}</Text>
          </Text>
          <Text className={styles.infoItem}>
            <Text className={styles.label}>时长</Text>
            <Text className={styles.value}>{game.duration}h</Text>
          </Text>
          <Text className={styles.infoItem}>
            <Text className={styles.label}>人数</Text>
            <Text className={styles.value}>{game.playerConfig}</Text>
          </Text>
        </View>
        
        <View className={styles.footer}>
          <View className={styles.players}>
            {game.players.slice(0, 3).map((player, idx) => (
              <Image 
                key={idx} 
                className={styles.playerAvatar} 
                src={player.avatar} 
                mode="aspectFill"
                style={{ marginLeft: idx > 0 ? '-12rpx' : '0' }}
              />
            ))}
            {game.players.length > 3 && (
              <Text className={styles.moreCount}>+{game.players.length - 3}</Text>
            )}
          </View>
          
          <View className={styles.right}>
            <Text className={styles.price}>
              <Text className={styles.priceSymbol}>¥</Text>
              {game.price}
            </Text>
            <Text className={styles.seats}>
              剩{remainingSeats}位
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default GameCard;
