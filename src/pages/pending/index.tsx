import React, { useState, useMemo } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import EmptyState from '@/components/EmptyState';
import StatusBadge from '@/components/StatusBadge';
import { useGameContext } from '@/context/GameContext';
import { ApplyRecord, Game, ApplyStatus } from '@/types/game';

const statusTabs: { key: ApplyStatus; label: string }[] = [
  { key: 'pending', label: '待审核' },
  { key: 'approved', label: '已通过' },
  { key: 'rejected', label: '已婉拒' },
  { key: 'all', label: '全部' }
];

const PendingPage: React.FC = () => {
  const { applies, games, approveApply, rejectApply, batchApprove, batchReject } = useGameContext();
  const [activeStatus, setActiveStatus] = useState<ApplyStatus>('pending');
  const [expandedGames, setExpandedGames] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filteredApplies = useMemo(() => {
    return applies.filter(a => {
      if (activeStatus !== 'all' && a.status !== activeStatus) return false;
      return true;
    });
  }, [applies, activeStatus]);

  const groupedByGame = useMemo(() => {
    const map = new Map<string, { game: Game; applies: ApplyRecord[] }>();
    filteredApplies.forEach(apply => {
      const game = games.find(g => g.id === apply.gameId);
      if (!game) return;
      if (!map.has(game.id)) {
        map.set(game.id, { game, applies: [] });
      }
      map.get(game.id)!.applies.push(apply);
    });
    return Array.from(map.values());
  }, [filteredApplies, games]);

  const toggleGame = (gameId: string) => {
    setExpandedGames(prev => {
      const next = new Set(prev);
      if (next.has(gameId)) {
        next.delete(gameId);
      } else {
        next.add(gameId);
      }
      return next;
    });
  };

  const toggleSelect = (applyId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(applyId)) {
        next.delete(applyId);
      } else {
        next.add(applyId);
      }
      return next;
    });
  };

  const toggleSelectAllOfGame = (gameId: string) => {
    const group = groupedByGame.find(g => g.game.id === gameId);
    if (!group) return;
    const applyIds = group.applies.map(a => a.id);
    const allSelected = applyIds.every(id => selectedIds.has(id));
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (allSelected) {
        applyIds.forEach(id => next.delete(id));
      } else {
        applyIds.forEach(id => next.add(id));
      }
      return next;
    });
  };

  const handleApprove = (applyId: string) => {
    Taro.showModal({
      title: '确认通过',
      content: '通过后将发送定金说明和到店地址给玩家',
      confirmText: '确认通过',
      confirmColor: '#7B2CBF',
      success: (res) => {
        if (res.confirm) {
          approveApply(applyId);
          setSelectedIds(prev => {
            const next = new Set(prev);
            next.delete(applyId);
            return next;
          });
          Taro.showToast({ title: '已通过', icon: 'success' });
        }
      }
    });
  };

  const handleReject = (applyId: string) => {
    Taro.showActionSheet({
      itemList: ['风格不匹配', '场次已满', '玩家经验不足', '其他原因'],
      success: () => {
        rejectApply(applyId);
        setSelectedIds(prev => {
          const next = new Set(prev);
          next.delete(applyId);
          return next;
        });
        Taro.showToast({ title: '已婉拒', icon: 'success' });
      }
    });
  };

  const handleBatchApprove = () => {
    if (selectedIds.size === 0) {
      Taro.showToast({ title: '请先选择报名', icon: 'none' });
      return;
    }
    Taro.showModal({
      title: '批量通过',
      content: `确认通过 ${selectedIds.size} 条报名？`,
      confirmText: '确认通过',
      confirmColor: '#7B2CBF',
      success: (res) => {
        if (res.confirm) {
          batchApprove(Array.from(selectedIds));
          setSelectedIds(new Set());
          Taro.showToast({ title: '已批量通过', icon: 'success' });
        }
      }
    });
  };

  const handleBatchReject = () => {
    if (selectedIds.size === 0) {
      Taro.showToast({ title: '请先选择报名', icon: 'none' });
      return;
    }
    Taro.showModal({
      title: '批量婉拒',
      content: `确认婉拒 ${selectedIds.size} 条报名？`,
      confirmText: '确认婉拒',
      confirmColor: '#F53F3F',
      success: (res) => {
        if (res.confirm) {
          batchReject(Array.from(selectedIds));
          setSelectedIds(new Set());
          Taro.showToast({ title: '已批量婉拒', icon: 'success' });
        }
      }
    });
  };

  const handleCardClick = (apply: ApplyRecord, game: Game) => {
    Taro.navigateTo({
      url: `/pages/reviewApply/index?applyId=${apply.id}&gameId=${game.id}`
    });
  };

  const pendingCount = applies.filter(a => a.status === 'pending').length;

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>报名管理</Text>
        <Text className={styles.subtitle}>
          待审核 <Text className={styles.count}>{pendingCount}</Text> 条
        </Text>
      </View>

      <View className={styles.statusTabs}>
        {statusTabs.map(tab => (
          <View
            key={tab.key}
            className={classnames(styles.statusTab, activeStatus === tab.key && styles.active)}
            onClick={() => setActiveStatus(tab.key)}
          >
            <Text>{tab.label}</Text>
          </View>
        ))}
      </View>

      <View className={styles.list}>
        {groupedByGame.length > 0 ? (
          groupedByGame.map(({ game, applies: gameApplies }) => {
            const isExpanded = expandedGames.has(game.id) || activeStatus === 'pending';
            const allSelected = gameApplies.every(a => selectedIds.has(a.id));
            return (
              <View key={game.id} className={styles.gameGroup}>
                <View 
                  className={styles.gameGroupHeader}
                  onClick={() => toggleGame(game.id)}
                >
                  <View 
                    className={styles.checkbox}
                    catchTap
                    onClick={() => toggleSelectAllOfGame(game.id)}
                  >
                    <View className={classnames(styles.checkboxInner, allSelected && styles.checked)}>
                      {allSelected && <Text className={styles.checkIcon}>✓</Text>}
                    </View>
                  </View>
                  <View className={styles.gameGroupInfo}>
                    <Text className={styles.gameGroupName}>{game.name}</Text>
                    <Text className={styles.gameGroupMeta}>
                      {game.date} {game.time} · {gameApplies.length}条申请
                    </Text>
                  </View>
                  <Text className={classnames(styles.arrow, isExpanded && styles.expanded)}>›</Text>
                </View>

                {isExpanded && (
                  <View className={styles.gameGroupBody}>
                    {gameApplies.map(apply => {
                      const isSelected = selectedIds.has(apply.id);
                      return (
                        <View
                          key={apply.id}
                          className={classnames(styles.applyItem, isSelected && styles.selected)}
                        >
                          <View 
                            className={styles.checkbox}
                            catchTap
                            onClick={() => toggleSelect(apply.id)}
                          >
                            <View className={classnames(styles.checkboxInner, isSelected && styles.checked)}>
                              {isSelected && <Text className={styles.checkIcon}>✓</Text>}
                            </View>
                          </View>

                          <View 
                            className={styles.applyContent}
                            onClick={() => handleCardClick(apply, game)}
                          >
                            <View className={styles.playerInfo}>
                              <Image 
                                className={styles.avatar} 
                                src={apply.player.avatar} 
                                mode="aspectFill"
                              />
                              <View className={styles.playerDetail}>
                                <View className={styles.playerNameRow}>
                                  <Text className={styles.playerName}>{apply.player.name}</Text>
                                  <StatusBadge status={apply.status} size="sm" />
                                </View>
                                <Text className={styles.playerPhone}>📞 {apply.phone || apply.player.phone || '未填写'}</Text>
                                <View className={styles.tags}>
                                  {apply.player.tags.slice(0, 3).map((tag, idx) => (
                                    <Text key={idx} className={styles.tag}>{tag}</Text>
                                  ))}
                                </View>
                              </View>
                            </View>

                            <View className={styles.applyInfo}>
                              <View className={styles.infoRow}>
                                <Text className={styles.infoLabel}>座位</Text>
                                <Text className={styles.infoValue}>
                                  {apply.seatNumber ? `${apply.seatNumber}号座` : `未选座 · ${apply.seatPreference}`}
                                </Text>
                              </View>
                              <View className={styles.infoRow}>
                                <Text className={styles.infoLabel}>角色</Text>
                                <Text className={styles.infoValue}>{apply.rolePreference}</Text>
                              </View>
                            </View>

                            {apply.message && (
                              <Text className={styles.message}>{apply.message}</Text>
                            )}

                            <Text className={styles.applyTime}>
                              申请时间：{apply.applyTime}
                            </Text>

                            {apply.status === 'pending' && (
                              <View className={styles.actions} catchTap>
                                <View 
                                  className={classnames(styles.btn, styles.btnReject)}
                                  onClick={() => handleReject(apply.id)}
                                >
                                  <Text>婉拒</Text>
                                </View>
                                <View 
                                  className={classnames(styles.btn, styles.btnApprove)}
                                  onClick={() => handleApprove(apply.id)}
                                >
                                  <Text>通过</Text>
                                </View>
                              </View>
                            )}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          }
        )
      ) : (
          <EmptyState 
            title="暂无报名记录"
            description="等待玩家报名吧~"
            icon="📋"
          />
        )}
      </View>

      {selectedIds.size > 0 && (
        <View className={styles.batchBar}>
          <View className={styles.batchInfo}>
            <Text>已选 {selectedIds.size} 项</Text>
          </View>
          <View className={styles.batchActions}>
            <View 
              className={classnames(styles.batchBtn, styles.batchReject)}
              onClick={handleBatchReject}
            >
              <Text>批量婉拒</Text>
            </View>
            <View 
              className={classnames(styles.batchBtn, styles.batchApprove)}
              onClick={handleBatchApprove}
            >
              <Text>批量通过</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default PendingPage;
