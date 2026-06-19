import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import StatusBadge from '@/components/StatusBadge';
import { useGameContext } from '@/context/GameContext';

const ReviewApplyPage: React.FC = () => {
  const router = useRouter();
  const applyId = router.params.applyId;
  const gameId = router.params.gameId;
  
  const { getApply, getGame, approveApply, rejectApply, waitlistApply } = useGameContext();
  const apply = getApply(applyId);
  const game = getGame(gameId);

  if (!apply || !game) {
    return (
      <View className={styles.container}>
        <Text style={{ padding: '100rpx', textAlign: 'center', display: 'block', color: '#999' }}>
          该报名不存在或已处理
        </Text>
      </View>
    );
  }

  const isProcessed = apply.status !== 'pending';

  const handleApprove = () => {
    Taro.showModal({
      title: '确认通过',
      content: '通过后将自动发送定金说明和到店地址给玩家',
      confirmText: '确认通过',
      confirmColor: '#7B2CBF',
      success: (res) => {
        if (res.confirm) {
          approveApply(applyId);
          Taro.showToast({ title: '已通过', icon: 'success' });
          setTimeout(() => Taro.navigateBack(), 1200);
        }
      }
    });
  };

  const handleWaitlist = () => {
    Taro.showModal({
      title: '放入候补',
      content: '玩家将进入候补名单，不占当前座位，有空位时可补位',
      confirmText: '确认候补',
      confirmColor: '#1677FF',
      success: (res) => {
        if (res.confirm) {
          waitlistApply(applyId);
          Taro.showToast({ title: '已放入候补', icon: 'success' });
          setTimeout(() => Taro.navigateBack(), 1200);
        }
      }
    });
  };

  const handleReject = () => {
    Taro.showActionSheet({
      itemList: ['风格不匹配', '场次已满', '玩家经验不足', '其他原因'],
      success: () => {
        rejectApply(applyId);
        Taro.showToast({ title: '已婉拒', icon: 'success' });
        setTimeout(() => Taro.navigateBack(), 1200);
      }
    });
  };

  const copyPhone = () => {
    const phone = apply.phone || apply.player.phone;
    if (!phone) return Taro.showToast({ title: '暂无手机号', icon: 'none' });
    Taro.setClipboardData({
      data: phone,
      success: () => Taro.showToast({ title: '手机号已复制', icon: 'success' })
    });
  };

  return (
    <View className={styles.container}>
      <View className={styles.playerHeader}>
        <Image className={styles.avatar} src={apply.player.avatar} mode="aspectFill" />
        <View className={styles.playerInfo}>
          <View className={styles.nameRow}>
            <Text className={styles.playerName}>{apply.player.name}</Text>
            <StatusBadge status={apply.status} size="md" />
          </View>
          <Text className={styles.playerPhone} onClick={copyPhone}>
            📞 {apply.phone || apply.player.phone || '未填写手机号'}（点击复制）
          </Text>
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
            <Text className={styles.label}>手机号</Text>
            <Text className={styles.value} onClick={copyPhone}>
              {apply.phone || apply.player.phone || '未填写'}
            </Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.label}>选座</Text>
            <Text className={styles.value}>
              {apply.seatNumber ? `${apply.seatNumber}号座位` : `未选座 · ${apply.seatPreference}`}
            </Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.label}>角色偏好</Text>
            <Text className={styles.value}>{apply.rolePreference}</Text>
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
          <View className={styles.infoRow}>
            <Text className={styles.label}>余位</Text>
            <Text className={styles.value}>
              {game.totalSeats - game.filledSeats} / {game.totalSeats}
            </Text>
          </View>
        </View>
      </View>

      {!isProcessed ? (
        <View className={styles.bottomBar}>
          <View className={classnames(styles.btn, styles.btnReject)} onClick={handleReject}>
            <Text>婉拒</Text>
          </View>
          <View className={classnames(styles.btn, styles.btnWaitlist)} onClick={handleWaitlist}>
            <Text>放入候补</Text>
          </View>
          <View className={classnames(styles.btn, styles.btnApprove)} onClick={handleApprove}>
            <Text>通过审核</Text>
          </View>
        </View>
      ) : (
        <View className={styles.bottomBar}>
          <View className={classnames(styles.btn, styles.btnBack)} onClick={() => Taro.navigateBack()}>
            <Text>返回列表</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default ReviewApplyPage;
