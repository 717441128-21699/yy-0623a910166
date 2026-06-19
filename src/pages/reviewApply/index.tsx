import React, { useState, useEffect } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { mockGames, mockPendingApplies } from '@/data/mockData';
import { Game, ApplyRecord } from '@/types/game';

const ReviewApplyPage: React.FC = () => {
  const router = useRouter();
  const applyId = router.params.applyId;
  const gameId = router.params.gameId;
  
  const [apply, setApply] = useState<ApplyRecord | null>(null);
  const [game, setGame] = useState<Game | null>(null);

  useEffect(() => {
    const foundApply = mockPendingApplies.find(a => a.id === applyId);
    const foundGame = mockGames.find(g => g.id === gameId);
    if (foundApply) setApply(foundApply);
    if (foundGame) setGame(foundGame);
  }, [applyId, gameId]);

  if (!apply || !game) {
    return (
      <View className={styles.container}>
        <Text>加载中...</Text>
      </View>
    );
  }

  const handleApprove = () => {
    Taro.showModal({
      title: '确认通过',
      content: '通过后将自动发送定金说明和到店地址给玩家',
      confirmText: '确认通过',
      confirmColor: '#7B2CBF',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '已通过', icon: 'success' });
          setTimeout(() => {
            Taro.navigateBack();
          }, 1500);
        }
      }
    });
  };

  const handleReject = () => {
    Taro.showActionSheet({
      itemList: ['风格不匹配', '场次已满', '玩家经验不足', '其他原因'],
      success: () => {
        Taro.showToast({ title: '已婉拒', icon: 'success' });
        setTimeout(() => {
          Taro.navigateBack();
        }, 1500);
      }
    });
  };

  return (
    <View className={styles.container}>
      <View className={styles.playerHeader}>
        <Image className={styles.avatar} src={apply.player.avatar} mode="aspectFill" />
        <View className={styles.playerInfo}>
          <Text className={styles.playerName}>{apply.player.name}</Text>
          <View className={styles.tags}>
            {apply.player.tags.map((tag, idx) => (
              <Text key={idx} className={styles.tag}>{tag}</Text>
            ))}
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>申请场次</View>
        <View className={styles.gameInfo}>
          <Text className={styles.gameName}>{game.name}</Text>
          <Text className={styles.gameTime}>{game.date} {game.time}</Text>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>报名信息</View>
        <View className={styles.infoList}>
          <View className={styles.infoRow}>
            <Text className={styles.label}>角色偏好</Text>
            <Text className={styles.value}>{apply.rolePreference}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.label}>座位偏好</Text>
            <Text className={styles.value}>{apply.seatPreference}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.label}>申请时间</Text>
            <Text className={styles.value}>{apply.applyTime}</Text>
          </View>
        </View>
      </View>

      {apply.message && (
        <View className={styles.section}>
          <View className={styles.sectionTitle}>玩家留言</View>
          <View className={styles.messageBox}>
            <Text className={styles.message}>{apply.message}</Text>
          </View>
        </View>
      )}

      <View className={styles.section}>
        <View className={styles.sectionTitle}>场次参考信息</View>
        <View className={styles.infoList}>
          <View className={styles.infoRow}>
            <Text className={styles.label}>剧本类型</Text>
            <Text className={styles.value}>{game.tags.join('、')}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.label}>价格</Text>
            <Text className={styles.value}>¥{game.price}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.label}>定金</Text>
            <Text className={styles.value}>¥{game.depositAmount}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.label}>DM</Text>
            <Text className={styles.value}>{game.dm}</Text>
          </View>
        </View>
      </View>

      <View className={styles.bottomBar}>
        <View className={[styles.btn, styles.btnReject].join(' ')} onClick={handleReject}>
          <Text>婉拒</Text>
        </View>
        <View className={[styles.btn, styles.btnApprove].join(' ')} onClick={handleApprove}>
          <Text>通过审核</Text>
        </View>
      </View>
    </View>
  );
};

export default ReviewApplyPage;
