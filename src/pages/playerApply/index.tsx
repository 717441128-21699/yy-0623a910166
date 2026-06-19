import React, { useState, useEffect } from 'react';
import { View, Text, Image, Input, Textarea } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { mockGames } from '@/data/mockData';
import { Game } from '@/types/game';

const roleOptions = ['男性角色', '女性角色', '都可以', 'C位角色', '边缘角色'];
const seatOptions = ['随便坐', '靠边坐', '中间位置', '靠近DM', '远离DM'];

const PlayerApplyPage: React.FC = () => {
  const router = useRouter();
  const gameId = router.params.gameId;
  
  const [game, setGame] = useState<Game | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    rolePreference: '都可以',
    seatPreference: '随便坐',
    message: ''
  });

  useEffect(() => {
    const found = mockGames.find(g => g.id === gameId);
    if (found) {
      setGame(found);
    }
  }, [gameId]);

  if (!game) {
    return (
      <View className={styles.container}>
        <Text>加载中...</Text>
      </View>
    );
  }

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleRoleSelect = (role: string) => {
    handleInputChange('rolePreference', role);
  };

  const handleSeatSelect = (seat: string) => {
    handleInputChange('seatPreference', seat);
  };

  const handleSubmit = () => {
    if (!formData.name) {
      Taro.showToast({ title: '请输入昵称', icon: 'none' });
      return;
    }
    if (!formData.phone) {
      Taro.showToast({ title: '请输入手机号', icon: 'none' });
      return;
    }

    Taro.showModal({
      title: '确认报名',
      content: `报名「${game.name}」，提交后店家会审核你的报名信息`,
      confirmText: '确认报名',
      confirmColor: '#7B2CBF',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '报名成功', icon: 'success' });
          setTimeout(() => {
            Taro.navigateBack();
          }, 1500);
        }
      }
    });
  };

  return (
    <View className={styles.container}>
      <View className={styles.gameHeader}>
        <Image className={styles.cover} src={game.cover} mode="aspectFill" />
        <View className={styles.gameInfo}>
          <Text className={styles.gameName}>{game.name}</Text>
          <Text className={styles.gameMeta}>
            {game.date} {game.time} · {game.dm}
          </Text>
          <Text className={styles.gameMeta}>
            {game.playerConfig} · 剩余{game.totalSeats - game.filledSeats}位
          </Text>
          <Text className={styles.price}>¥{game.price}</Text>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>基本信息</View>
        <View className={styles.formItem}>
          <Text className={styles.label}>昵称</Text>
          <View className={styles.inputWrap}>
            <Input
              className={styles.input}
              placeholder="请输入你的昵称"
              value={formData.name}
              onInput={(e) => handleInputChange('name', e.detail.value)}
            />
          </View>
        </View>
        <View className={styles.formItem}>
          <Text className={styles.label}>手机号</Text>
          <View className={styles.inputWrap}>
            <Input
              className={styles.input}
              type="number"
              placeholder="请输入手机号"
              value={formData.phone}
              onInput={(e) => handleInputChange('phone', e.detail.value)}
              maxlength={11}
            />
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>角色偏好</View>
        <View className={styles.roleOptions}>
          {roleOptions.map(role => (
            <View 
              key={role}
              className={classnames(styles.roleOption, formData.rolePreference === role && styles.active)}
              onClick={() => handleRoleSelect(role)}
            >
              <Text>{role}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>座位偏好</View>
        <View className={styles.optionList}>
          {seatOptions.map(seat => (
            <View 
              key={seat}
              className={classnames(styles.optionItem, formData.seatPreference === seat && styles.active)}
              onClick={() => handleSeatSelect(seat)}
            >
              <Text>{seat}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>留言（选填）</View>
        <View className={styles.textareaWrap}>
          <Textarea
            className={styles.textarea}
            placeholder="有什么想跟DM或者店家说的..."
            value={formData.message}
            onInput={(e) => handleInputChange('message', e.detail.value)}
            maxlength={200}
            showConfirmBar={false}
            autoHeight
          />
        </View>
      </View>

      <View className={styles.notice}>
        <Text className={styles.title}>⚠️ 报名须知</Text>
        <Text className={styles.text}>
          {game.warnings}
        </Text>
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.submitBtn} onClick={handleSubmit}>
          <Text>提交报名</Text>
        </View>
        <Text className={styles.depositTip}>
          通过审核后需支付 ¥{game.depositAmount} 定金锁定车位
        </Text>
      </View>
    </View>
  );
};

export default PlayerApplyPage;
