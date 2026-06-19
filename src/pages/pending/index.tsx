import React, { useMemo } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import EmptyState from '@/components/EmptyState';
import StatusBadge from '@/components/StatusBadge';
import { useGameContext } from '@/context/GameContext';
import { ApplyRecord, Game, ReviewItem } from '@/types/game';

const PendingPage: React.FC = () => {
  const { applies, games, approveApply, rejectApply } = useGameContext();

  const reviewItems: ReviewItem[] = useMemo(() => {
    return applies
      .filter(a => a.status === 'pending')
      .map(apply => ({
        apply,
        game: games.find(g => g.id === apply.gameId)!
      }))
      .filter(item => !!item.game);
  }, [applies, games]);

  const handleApprove = (applyId: string) => {
    Taro.showModal({
      title: '确认通过',
      content: '通过后将发送定金说明和到店地址给玩家',
      confirmText: '确认通过',
      confirmColor: '#7B2CBF',
      success: (res) => {
        if (res.confirm) {
          approveApply(applyId);
          Taro.showToast({ title: '已通过，通知已发送', icon: 'success' });
        }
      }
    });
  };

  const handleReject = (applyId: string) => {
    Taro.showActionSheet({
      itemList: ['风格不匹配', '场次已满', '玩家经验不足', '其他原因'],
      success: () => {
        rejectApply(applyId);
        Taro.showToast({ title: '已婉拒', icon: 'success' });
      }
    });
  };

  const handleCardClick = (apply: ApplyRecord, game: Game) => {
    Taro.navigateTo({
      url: `/pages/reviewApply/index?applyId=${apply.id}&gameId=${game.id}`
    });
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>待审核报名</Text>
        <Text className={styles.subtitle}>
          共 <Text className={styles.count}>{reviewItems.length}</Text> 条待处理报名
        </Text>
      </View>

      <View className={styles.list}>
        {reviewItems.length > 0 ? (
          reviewItems.map(item => (
            <View 
              key={item.apply.id} 
              className={styles.card}
              onClick={() => handleCardClick(item.apply, item.game)}
            >
              <View className={styles.cardHeader}>
                <Text className={styles.gameName}>{item.game.name}</Text>
                <Text className={styles.gameTime}>
                  {item.game.date} {item.game.time}
                </Text>
              </View>
              
              <View className={styles.cardBody}>
                <View className={styles.playerInfo}>
                  <Image 
                    className={styles.avatar} 
                    src={item.apply.player.avatar} 
                    mode="aspectFill"
                  />
                  <View className={styles.playerDetail}>
                    <Text className={styles.playerName}>
                      {item.apply.player.name}
                    </Text>
                    <View className={styles.tags}>
                      {item.apply.player.tags.slice(0, 3).map((tag, idx) => (
                        <Text key={idx} className={styles.tag}>{tag}</Text>
                      ))}
                    </View>
                  </View>
                  <StatusBadge status="pending" size="sm" />
                </View>

                <View className={styles.applyInfo}>
                  <View className={styles.infoRow}>
                    <Text className={styles.infoLabel}>角色偏好</Text>
                    <Text className={styles.infoValue}>{item.apply.rolePreference}</Text>
                  </View>
                  <View className={styles.infoRow}>
                    <Text className={styles.infoLabel}>座位偏好</Text>
                    <Text className={styles.infoValue}>{item.apply.seatPreference}</Text>
                  </View>
                </View>

                {item.apply.message && (
                  <Text className={styles.message}>{item.apply.message}</Text>
                )}

                <Text className={styles.applyTime}>
                  申请时间：{item.apply.applyTime}
                </Text>

                <View className={styles.actions} catchTap>
                  <View 
                    className={classnames(styles.btn, styles.btnReject)}
                    onClick={() => handleReject(item.apply.id)}
                  >
                    <Text>婉拒</Text>
                  </View>
                  <View 
                    className={classnames(styles.btn, styles.btnApprove)}
                    onClick={() => handleApprove(item.apply.id)}
                  >
                    <Text>通过</Text>
                  </View>
                </View>
              </View>
            </View>
          ))
        ) : (
          <EmptyState 
            title="暂无待处理报名"
            description="所有报名都已处理完毕"
            icon="✅"
          />
        )}
      </View>
    </View>
  );
};

export default PendingPage;
