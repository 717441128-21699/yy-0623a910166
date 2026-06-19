import React from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro, { useRouter, useShareAppMessage } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import StatusBadge from '@/components/StatusBadge';
import { useGameContext } from '@/context/GameContext';

const GameDetailPage: React.FC = () => {
  const router = useRouter();
  const gameId = router.params.id;
  const { getGame } = useGameContext();
  const game = getGame(gameId);

  useShareAppMessage(() => {
    if (!game) {
      return {
        title: '剧本站 - 限定车队招募',
        path: '/pages/home/index'
      };
    }
    return {
      title: `【${game.tags[0] || '招募'}】${game.name} - ${game.date} ${game.time}`,
      path: `/pages/gameDetail/index?id=${game.id}`,
      imageUrl: game.cover
    };
  });

  if (!game) {
    return (
      <View className={styles.container}>
        <Text>该车队不存在</Text>
      </View>
    );
  }

  const remainingSeats = game.totalSeats - game.filledSeats;
  const isFull = game.status === 'full' || game.status === 'ongoing' || game.status === 'finished';

  const handleApply = () => {
    Taro.navigateTo({
      url: `/pages/playerApply/index?gameId=${game.id}`
    });
  };

  return (
    <View className={styles.container}>
      <View className={styles.cover}>
        <Image className={styles.coverImg} src={game.cover} mode="aspectFill" />
        <View className={styles.coverOverlay} />
        
        <View className={styles.coverBadges}>
          <StatusBadge status={game.type} size="md" />
          <StatusBadge status={game.status} size="md" />
        </View>
        
        <Button className={styles.shareBtn} openType="share">
          <Text>📤 分享招募</Text>
        </Button>
      </View>

      <View className={styles.content}>
        <View className={styles.infoCard}>
          <Text className={styles.gameTitle}>{game.name}</Text>
          <View className={styles.tagList}>
            {game.tags.map((tag, idx) => (
              <Text key={idx} className={styles.tag}>{tag}</Text>
            ))}
          </View>
          
          <View className={styles.infoGrid}>
            <View className={styles.infoItem}>
              <Text className={styles.label}>开戏时间</Text>
              <Text className={styles.value}>{game.date} {game.time}</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.label}>游戏时长</Text>
              <Text className={styles.value}>{game.duration} 小时</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.label}>DM</Text>
              <Text className={styles.value}>{game.dm}</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.label}>人数配置</Text>
              <Text className={styles.value}>{game.playerConfig}</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.label}>授权城市</Text>
              <Text className={styles.value}>{game.city}</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.label}>费用</Text>
              <Text className={classnames(styles.value, styles.price)}>¥{game.price}</Text>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text>已报名玩家</Text>
            <Text className={styles.remain}>剩余 {remainingSeats} 位</Text>
          </View>
          <View className={styles.playerList}>
            {game.players.map(player => (
              <View key={player.id} className={styles.playerItem}>
                <Image 
                  className={styles.playerAvatar} 
                  src={player.avatar} 
                  mode="aspectFill"
                />
                <Text className={styles.playerName}>{player.name}</Text>
              </View>
            ))}
            {Array(Math.max(0, remainingSeats)).fill(0).map((_, idx) => (
              <View key={`empty-${idx}`} className={styles.playerItem}>
                <View className={styles.emptySeat}>
                  <Text>虚位</Text>
                </View>
                <Text className={styles.playerName}>待报名</Text>
              </View>
            ))}
          </View>
          
          {game.waitlist.length > 0 && (
            <View style={{ marginTop: '24rpx', paddingTop: '24rpx', borderTop: '1rpx solid #f2f3f5' }}>
              <Text style={{ fontSize: '24rpx', color: '#86909C', marginBottom: '16rpx' }}>
                候补名单（{game.waitlist.length}人）
              </Text>
              <View className={styles.playerList}>
                {game.waitlist.map(player => (
                  <View key={player.id} className={styles.playerItem}>
                    <Image 
                      className={styles.playerAvatar} 
                      src={player.avatar} 
                      mode="aspectFill"
                      style={{ opacity: 0.6 }}
                    />
                    <Text className={styles.playerName}>{player.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text>📋 开本须知</Text>
          </View>
          <View className={styles.ruleList}>
            <View className={styles.ruleItem}>
              <Text className={styles.icon}>👶</Text>
              <Text className={styles.text}>接受新手</Text>
              <Text className={classnames(styles.status, game.acceptNewbie ? styles.yes : styles.no)}>
                {game.acceptNewbie ? '是' : '否'}
              </Text>
            </View>
            <View className={styles.ruleItem}>
              <Text className={styles.icon}>👥</Text>
              <Text className={styles.text}>需要熟人局</Text>
              <Text className={classnames(styles.status, game.needAcquaintance ? styles.yes : styles.no)}>
                {game.needAcquaintance ? '是' : '否'}
              </Text>
            </View>
            <View className={styles.ruleItem}>
              <Text className={styles.icon}>💰</Text>
              <Text className={styles.text}>定金金额</Text>
              <Text className={classnames(styles.status, styles.yes)}>¥{game.depositAmount}</Text>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text>⚠️ 禁忌提醒</Text>
          </View>
          <View className={styles.notice}>
            <Text className={styles.title}>DM特别提醒</Text>
            <Text className={styles.text}>{game.warnings}</Text>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text>📍 门店地址</Text>
          </View>
          <Text style={{ fontSize: '28rpx', color: '#4E5969' }}>{game.address}</Text>
        </View>
      </View>

      <View className={styles.bottomBar}>
        <Button className={classnames(styles.btn, styles.btnSecondary)} openType="share">
          <Text>📤 分享招募</Text>
        </Button>
        <View 
          className={classnames(
            styles.btn, 
            isFull ? styles.btnDisabled : styles.btnPrimary
          )}
          onClick={!isFull ? handleApply : undefined}
        >
          <Text>{isFull ? '已满员' : '立即报名'}</Text>
        </View>
      </View>
    </View>
  );
};

export default GameDetailPage;
