import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';

interface StatusBadgeProps {
  status: 'recruiting' | 'full' | 'ongoing' | 'finished' | 'pending' | 'approved' | 'rejected' | 'waitlist' | 'city' | 'limited' | 'normal';
  text?: string;
  size?: 'sm' | 'md';
}

const statusMap = {
  recruiting: { text: '招募中', type: 'success' },
  full: { text: '已满员', type: 'warning' },
  ongoing: { text: '进行中', type: 'primary' },
  finished: { text: '已结束', type: 'default' },
  pending: { text: '待审核', type: 'warning' },
  approved: { text: '已通过', type: 'success' },
  rejected: { text: '已婉拒', type: 'error' },
  waitlist: { text: '已候补', type: 'info' },
  city: { text: '城限', type: 'gold' },
  limited: { text: '独家', type: 'gold' },
  normal: { text: '盒装', type: 'default' }
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, text, size = 'sm' }) => {
  const config = statusMap[status] || statusMap.normal;
  const displayText = text || config.text;

  return (
    <View className={classnames(styles.badge, styles[config.type], styles[size])}>
      <Text className={styles.text}>{displayText}</Text>
    </View>
  );
};

export default StatusBadge;
