import React, { useMemo } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro, { useRouter, useShareAppMessage } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import StatusBadge from '@/components/StatusBadge';
import SeatMap from '@/components/SeatMap';
import { useGameContext } from '@/context/GameContext';
import { Game } from '@/types/game';

const GameDetailPage: React.FC = () => {
  const router = useRouter();
  const gameId = router.params.id;
  const nameParam = router.params.name;
  const dateParam = router.params.date;
  const priceParam = router.params.price;
  const dmParam = router.params.dm;
  const cityParam = router.params.city;
  const seatsParam = router.params.seats;
  const filledParam = router.params.filled;

  const { getGame } = useGameContext();
  const game = getGame(gameId);

  const previewGame: Partial<Game> | null = useMemo(() => {
    if (game) return null;
    if (!nameParam || !dateParam) return null;
    return {
      id: gameId || 'preview',
      name: decodeURIComponent(nameParam),
      date: dateParam,
      price: Number(priceParam) || 0,
      dm: dmParam ? decodeURIComponent(dmParam) : '',
      city: cityParam ? decodeURIComponent(cityParam) : '',
      totalSeats: Number(seatsParam) || 6,
      filledSeats: Number(filledParam) || 0,
      status: 'recruiting'
    };
  }, [game, nameParam, dateParam, priceParam, dmParam, cityParam, seatsParam, filledParam, gameId]);

  const displayGame = game || previewGame;

  useShareAppMessage(() => {
    if (!displayGame) {
      return {
        title: '剧本站 - 限定车队招募',
        path: '/pages/home/index'
      };
    }
    const remain = (displayGame.totalSeats || 0) - (displayGame.filledSeats || 0);
    const query = [
      `id=${displayGame.id}`,
      `name=${encodeURIComponent(displayGame.name || '')}`,
      `date=${displayGame.date}`,
      `time=${displayGame.time || ''}`,
      `price=${displayGame.price}`,
      `dm=${encodeURIComponent(displayGame.dm || '')}`,
      `city=${encodeURIComponent(displayGame.city || '')}`,
      `seats=${displayGame.totalSeats}`,
      `filled=${displayGame.filledSeats}`
    ].join('&');

    return {
      title: `【${displayGame.tags?.[0] || '限定招募'}】${displayGame.name} - ${remain}位等你上车`,
      path: `/pages/gameDetail/index?${query}`,
      imageUrl: displayGame.cover
    };
  });

  if (!displayGame) {
    return (
      <View className={styles.container}>
        <Text style={{ padding: '100rpx', textAlign: 'center', display: 'block' }}>
          该车队不存在或已结束
        </Text>
      </View>
    );
  }

  const totalSeats = displayGame.totalSeats || 0;
  const filledSeats = displayGame.filledSeats || 0;
  const remainingSeats = totalSeats - filledSeats;
  const isFull = displayGame.status === 'full' || displayGame.status === 'ongoing' || displayGame.status === 'finished';
  const isPreview = !game;

  const handleApply = () => {
    if (isPreview) {
      Taro.showToast({ title: '请在小程序内查看完整信息', icon: 'none' });
      return;
    }
    Taro.navigateTo({
      url: `/pages/playerApply/index?gameId=${game.id}`
    });
  };

  return (
    <View className={styles.container}>
      <View className={styles.cover}>
        <Image className={styles.coverImg} src={displayGame.cover} mode="aspectFill" />
        <View className={styles.coverOverlay} />
        
        <View className={styles.coverBadges}>
          <StatusBadge status={displayGame.type || 'city'} size="md" />
          <StatusBadge status={displayGame.status || 'recruiting'} size="md" />
        </View>
        
        <Button className={styles.shareBtn} openType="share">
          <Text>📤 分享招募</Text>
        </Button>
      </View>

      <View className={styles.content}>
        <View className={styles.infoCard}>
          <Text className={styles.gameTitle}>{displayGame.name}</Text>
          <View className={styles.tagList}>
            {(displayGame.tags || []).map((tag, idx) => (
              <Text key={idx} className={styles.tag}>{tag}</Text>
            ))}
          </View>
          
          <View className={styles.infoGrid}>
            <View className={styles.infoItem}>
              <Text className={styles.label}>开戏时间</Text>
              <Text className={styles.value}>{displayGame.date} {displayGame.time}</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.label}>游戏时长</Text>
              <Text className={styles.value}>{displayGame.duration} 小时</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.label}>DM</Text>
              <Text className={styles.value}>{displayGame.dm}</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.label}>人数配置</Text>
              <Text className={styles.value}>{displayGame.playerConfig || `${totalSeats}人`}</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.label}>授权城市</Text>
              <Text className={styles.value}>{displayGame.city}</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.label}>费用</Text>
              <Text className={classnames(styles.value, styles.price)}>¥{displayGame.price}</Text>
            </View>
          </View>
        </View>

        {!isPreview && game && (
          <View className={styles.section}>
            <View className={styles.sectionTitle}>
              <Text>🪑 座位视图</Text>
              <Text className={styles.remain}>剩余 {remainingSeats} 位</Text>
            </View>
            <SeatMap
              seats={game.seats}
              players={game.players}
              showLabels={true}
            />
          </View>
        )}

        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text>已报名玩家</Text>
            <Text className={styles.remain}>剩余 {remainingSeats} 位</Text>
          </View>
          <View className={styles.playerList}>
            {(displayGame.players || []).map(player => (
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
          
          {displayGame.waitlist && displayGame.waitlist.length > 0 && (
            <View style={{ marginTop: '24rpx', paddingTop: '24rpx', borderTop: '1rpx solid #f2f3f5' }}>
              <Text style={{ fontSize: '24rpx', color: '#86909C', marginBottom: '16rpx' }}>
                候补名单（{displayGame.waitlist.length}人）
              </Text>
              <View className={styles.playerList}>
                {displayGame.waitlist.map(player => (
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

        {!isPreview && game && (
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
        )}

        {!isPreview && game && game.warnings && (
          <View className={styles.section}>
            <View className={styles.sectionTitle}>
              <Text>⚠️ 禁忌提醒</Text>
            </View>
            <View className={styles.notice}>
              <Text className={styles.title}>DM特别提醒</Text>
              <Text className={styles.text}>{game.warnings}</Text>
            </View>
          </View>
        )}

        {!isPreview && game && (
          <View className={styles.section}>
            <View className={styles.sectionTitle}>
              <Text>📍 门店地址</Text>
            </View>
            <Text style={{ fontSize: '28rpx', color: '#4E5969' }}>{game.address}</Text>
          </View>
        )}
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
          <Text>{isFull ? '已满员' : (isPreview ? '打开小程序报名' : '立即报名')}</Text>
        </View>
      </View>
    </View>
  );
};

export default GameDetailPage;
