import React, { useState } from 'react';
import { View, Text, Input, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';

const CreateGamePage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'city' as 'city' | 'limited' | 'normal',
    city: '',
    date: '',
    time: '',
    dm: '',
    duration: '',
    price: '',
    totalSeats: '',
    playerConfig: '',
    warnings: '',
    acceptNewbie: true,
    needAcquaintance: false,
    depositAmount: ''
  });

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSwitchChange = (key: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: !(prev as any)[key]
    }));
  };

  const handleTypeChange = (type: 'city' | 'limited' | 'normal') => {
    setFormData(prev => ({
      ...prev,
      type
    }));
  };

  const handleDateChange = (e: any) => {
    handleInputChange('date', e.detail.value);
  };

  const handleTimeChange = (e: any) => {
    handleInputChange('time', e.detail.value);
  };

  const handleSubmit = () => {
    if (!formData.name) {
      Taro.showToast({ title: '请输入剧本名称', icon: 'none' });
      return;
    }
    if (!formData.date) {
      Taro.showToast({ title: '请选择开戏日期', icon: 'none' });
      return;
    }
    if (!formData.time) {
      Taro.showToast({ title: '请选择开戏时间', icon: 'none' });
      return;
    }
    if (!formData.dm) {
      Taro.showToast({ title: '请输入DM名称', icon: 'none' });
      return;
    }
    if (!formData.price) {
      Taro.showToast({ title: '请输入价格', icon: 'none' });
      return;
    }

    Taro.showModal({
      title: '确认创建',
      content: '创建后将生成可分享的招募卡片',
      confirmText: '确认创建',
      confirmColor: '#7B2CBF',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '创建成功', icon: 'success' });
          setTimeout(() => {
            Taro.navigateBack();
          }, 1500);
        }
      }
    });
  };

  return (
    <View className={styles.container}>
      <View className={styles.form}>
        <View className={styles.section}>
          <View className={styles.sectionTitle}>基本信息</View>
          
          <View className={styles.formItem}>
            <Text className={styles.label}>剧本名称</Text>
            <View className={styles.inputWrap}>
              <Input
                className={styles.input}
                placeholder="请输入剧本名称"
                value={formData.name}
                onInput={(e) => handleInputChange('name', e.detail.value)}
              />
            </View>
          </View>
          
          <View className={styles.formItem}>
            <Text className={styles.label}>剧本类型</Text>
            <View className={styles.typeSelector}>
              <View 
                className={classnames(styles.typeItem, formData.type === 'city' && styles.active)}
                onClick={() => handleTypeChange('city')}
              >
                <Text>城限</Text>
              </View>
              <View 
                className={classnames(styles.typeItem, formData.type === 'limited' && styles.active)}
                onClick={() => handleTypeChange('limited')}
              >
                <Text>独家</Text>
              </View>
              <View 
                className={classnames(styles.typeItem, formData.type === 'normal' && styles.active)}
                onClick={() => handleTypeChange('normal')}
              >
                <Text>盒装</Text>
              </View>
            </View>
          </View>
          
          <View className={styles.formItem}>
            <Text className={styles.label}>授权城市</Text>
            <View className={styles.inputWrap}>
              <Input
                className={styles.input}
                placeholder="请输入授权城市"
                value={formData.city}
                onInput={(e) => handleInputChange('city', e.detail.value)}
              />
            </View>
          </View>
          
          <View className={styles.formItem}>
            <Text className={styles.label}>人数配置</Text>
            <View className={styles.inputWrap}>
              <Input
                className={styles.input}
                placeholder="如：3男3女"
                value={formData.playerConfig}
                onInput={(e) => handleInputChange('playerConfig', e.detail.value)}
              />
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionTitle}>场次信息</View>
          
          <View className={styles.formItem}>
            <Text className={styles.label}>开戏日期</Text>
            <View className={styles.inputWrap}>
              <Input
                className={styles.input}
                type="date"
                placeholder="请选择日期"
                value={formData.date}
                onInput={handleDateChange}
              />
            </View>
          </View>
          
          <View className={styles.formItem}>
            <Text className={styles.label}>开戏时间</Text>
            <View className={styles.inputWrap}>
              <Input
                className={styles.input}
                type="time"
                placeholder="请选择时间"
                value={formData.time}
                onInput={handleTimeChange}
              />
            </View>
          </View>
          
          <View className={styles.formItem}>
            <Text className={styles.label}>DM</Text>
            <View className={styles.inputWrap}>
              <Input
                className={styles.input}
                placeholder="请输入DM名称"
                value={formData.dm}
                onInput={(e) => handleInputChange('dm', e.detail.value)}
              />
            </View>
          </View>
          
          <View className={styles.formItem}>
            <Text className={styles.label}>游戏时长</Text>
            <View className={styles.inputWrap}>
              <Input
                className={styles.input}
                type="digit"
                placeholder="请输入时长（小时）"
                value={formData.duration}
                onInput={(e) => handleInputChange('duration', e.detail.value)}
              />
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionTitle}>费用信息</View>
          
          <View className={styles.formItem}>
            <Text className={styles.label}>单人价格</Text>
            <View className={styles.inputWrap}>
              <Input
                className={styles.input}
                type="digit"
                placeholder="请输入价格（元）"
                value={formData.price}
                onInput={(e) => handleInputChange('price', e.detail.value)}
              />
            </View>
          </View>
          
          <View className={styles.formItem}>
            <Text className={styles.label}>定金金额</Text>
            <View className={styles.inputWrap}>
              <Input
                className={styles.input}
                type="digit"
                placeholder="请输入定金（元）"
                value={formData.depositAmount}
                onInput={(e) => handleInputChange('depositAmount', e.detail.value)}
              />
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionTitle}>玩家须知</View>
          
          <View className={styles.switchRow}>
            <Text className={styles.label}>接受新手</Text>
            <View 
              className={classnames(styles.switch, formData.acceptNewbie && styles.active)}
              onClick={() => handleSwitchChange('acceptNewbie')}
            />
          </View>
          
          <View className={styles.switchRow}>
            <Text className={styles.label}>需要熟人局</Text>
            <View 
              className={classnames(styles.switch, formData.needAcquaintance && styles.active)}
              onClick={() => handleSwitchChange('needAcquaintance')}
            />
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionTitle}>禁忌提醒</View>
          <View style={{ padding: '24rpx 32rpx' }}>
            <Textarea
              className={styles.textarea}
              placeholder="请输入DM特别提醒、禁忌事项等..."
              value={formData.warnings}
              onInput={(e) => handleInputChange('warnings', e.detail.value)}
              maxlength={200}
              showConfirmBar={false}
              autoHeight
            />
          </View>
        </View>
      </View>

      <View className={styles.footer}>
        <View className={styles.submitBtn} onClick={handleSubmit}>
          <Text>创建车队并生成招募卡</Text>
        </View>
        <Text className={styles.tip}>创建后可生成分享卡片转发给玩家</Text>
      </View>
    </View>
  );
};

export default CreateGamePage;
