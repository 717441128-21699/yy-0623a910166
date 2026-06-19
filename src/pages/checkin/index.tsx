import React, { useState } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import EmptyState from '@/components/EmptyState';
import SeatMap from '@/components/SeatMap';
import { useGameContext } from '@/context/GameContext';

const CheckinPage: React.FC = () => {
  const { games, getTodayGames, checkIn, promoteFromWaitlist, checkedPlayerIds } = useGameContext();
  const [activeTab, setActiveTab] = useState<'today' | 'all'>('today');
  const [expandedGameId, setExpandedGameId] = useState<string | null>(null);

  const displayGames = activeTab === 'today' ? getTodayGames() : games;

  const toggleGame = (gameId: string) => {
    setExpandedGameId(prev => prev === gameId ? null : gameId);
  };

  const handleCheckIn = (playerId: string) => {
    if (checkedPlayerIds.includes(playerId)) {
      Taro.showToast({ title: '该玩家已签到', icon: 'none' });
      return;
    }
    Taro.showModal({
      title: '确认签到',
      content: '确认该玩家已到店？',
      confirmText: '确认签到',
      confirmColor: '#7B2CBF',
      success: (res) => {
        if (res.confirm) {
          checkIn(playerId);
          Taro.showToast({ title: '签到成功', icon: 'success' });
        }
      }
    });
  };

  const handlePromote = (gameId: string, playerId: string, playerName: string, gameName: string) => {
    Taro.showModal({
      title: '候补补位',
      content: `是否将 ${playerName} 补位到 ${gameName}？`,
      confirmText: '确认补位',
      confirmColor: '#E6B42F',
      success: (res) => {
        if (res.confirm) {
          promoteFromWaitlist(gameId, playerId);
          Taro.showToast({ title: '补位成功', icon: 'success' });
        }
      }
    });
  };

  const callPhone = (phone?: string) => {
    if (!phone) {
      Taro.showToast({ title: '暂无手机号', icon: 'none' });
      return;
    }
    Taro.makePhoneCall({
      phoneNumber: phone,
      fail: () => {
        Taro.showToast({ title: '拨打失败', icon: 'none' });
      }
    });
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>签到管理</Text>
        <Text className={styles.subtitle}>今天有 {getTodayGames().length} 场剧本</Text>
      </View>

      <View className={styles.tabs}>
        <View 
          className={classnames(styles.tabItem, activeTab === 'today' && styles.active)}
          onClick={() => setActiveTab('today')}
        >
          <Text>今日场次</Text>
        </View>
        <View 
          className={classnames(styles.tabItem, activeTab === 'all' && styles.active)}
          onClick={() => setActiveTab('all')}
        >
          <Text>全部</Text>
        </View>
      </View>

      <View className={styles.list}>
        {displayGames.length > 0 ? (
          displayGames.map(game => {
            const isExpanded = expandedGameId === game.id;
            const checkedCount = game.players.filter(p => checkedPlayerIds.includes(p.id)).length;
            const uncheckedCount = game.players.length - checkedCount;

            return (
              <View key={game.id} className={styles.gameCard}>
                <View 
                  className={styles.gameHeader}
                  onClick={() => toggleGame(game.id)}
                >
                  <View className={styles.gameInfo}>
                    <Text className={styles.gameName}>{game.name}</Text>
                    <Text className={styles.gameMeta}>
                      {game.date} {game.time} · {game.duration}h · DM {game.dm}
                    </Text>
                  </View>
                  <View className={styles.gameStats}>
                    <View className={styles.statItem}>
                      <Text className={styles.statNum checked}>{checkedCount}</Text>
                      <Text className={styles.statLabel}>已到</Text>
                    </View>
                    <View className={styles.statItem}>
                      <Text className={styles.statNum}>{uncheckedCount}</Text>
                      <Text className={styles.statLabel}>未到</Text>
                    </View>
                    <View className={styles.statItem}>
                      <Text className={styles.statNum waitlist}>{game.waitlist.length}</Text>
                      <Text className={styles.statLabel}>候补</Text>
                    </View>
                  </View>
                </View>

                {isExpanded && (
                  <View className={styles.gameDetail}>
                    <View className={styles.seatSection}>
                      <Text className={styles.sectionTitle}>座位图</Text>
                      <SeatMap 
                        seats={game.seats}
                        players={game.players}
                        showPlayerName={true}
                        dmPosition="top"
                      />
                    </View>

                    <View className={styles.playerSection}>
                      <Text className={styles.sectionTitle}>
                        已到店 ({checkedCount}/{game.players.length})
                      </Text>
                      <View className={styles.playerList}>
                        {game.players.filter(p => checkedPlayerIds.includes(p.id)).map(player => (
                          <View key={player.id} className={classnames(styles.playerItem, styles.checkedItem)}>
                            <Image 
                              className={styles.playerAvatar} 
                              src={player.avatar} 
                              mode="aspectFill"
                            />
                            <View className={styles.playerDetail}>
                              <View className={styles.playerNameRow}>
                                <Text className={styles.playerName}>{player.name}</Text>
                                {player.seatNumber && (
                                  <Text className={styles.seatBadge}>{player.seatNumber}座</Text>
                                )}
                              </View>
                              <Text 
                                className={styles.playerPhone}
                                onClick={() => callPhone(player.phone)}
                              >
                                📞 {player.phone || '暂无手机号'}
                              </Text>
                            </View>
                            <View className={styles.statusBadge checked}>
                              <Text>✓ 已到</Text>
                            </View>
                          </View>
                        ))}
                        {checkedCount === 0 && (
                          <View className={styles.emptyHint}>
                            <Text>暂无玩家到店</Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <View className={styles.playerSection}>
                      <Text className={styles.sectionTitle}>
                        未到店 ({uncheckedCount})
                      </Text>
                      <View className={styles.playerList}>
                        {game.players.filter(p => !checkedPlayerIds.includes(p.id)).map(player => (
                          <View key={player.id} className={styles.playerItem}>
                            <Image 
                              className={styles.playerAvatar} 
                              src={player.avatar} 
                              mode="aspectFill"
                            />
                            <View className={styles.playerDetail}>
                              <View className={styles.playerNameRow}>
                                <Text className={styles.playerName}>{player.name}</Text>
                                {player.seatNumber && (
                                  <Text className={styles.seatBadge}>{player.seatNumber}座</Text>
                                )}
                              </View>
                              <Text 
                                className={styles.playerPhone}
                                onClick={() => callPhone(player.phone)}
                              >
                                📞 {player.phone || '暂无手机号'}
                              </Text>
                            </View>
                            <View 
                              className={styles.checkBtn}
                              onClick={() => handleCheckIn(player.id)}
                            >
                              <Text>签到</Text>
                            </View>
                          </View>
                        ))}
                        {uncheckedCount === 0 && (
                          <View className={styles.emptyHint}>
                            <Text>全部玩家已到店</Text>
                          </View>
                        )}
                      </View>
                    </View>

                    {game.waitlist.length > 0 && (
                      <View className={styles.playerSection}>
                        <Text className={styles.sectionTitle}>
                          候补名单 ({game.waitlist.length}人)
                        </Text>
                        <View className={styles.playerList}>
                          {game.waitlist.map((player, index) => (
                            <View key={player.id} className={classnames(styles.playerItem, styles.waitlistItem)}>
                              <View className={styles.waitlistRank}>
                                <Text>{index + 1}</Text>
                              </View>
                              <Image 
                                className={styles.playerAvatar} 
                                src={player.avatar} 
                                mode="aspectFill"
                              />
                              <View className={styles.playerDetail}>
                                <View className={styles.playerNameRow}>
                                  <Text className={styles.playerName}>{player.name}</Text>
                                </View>
                                <Text 
                                  className={styles.playerPhone}
                                  onClick={() => callPhone(player.phone)}
                                >
                                  📞 {player.phone || '暂无手机号'}
                                </Text>
                              </View>
                              <View 
                                className={styles.promoteBtn}
                                onClick={() => handlePromote(game.id, player.id, player.name, game.name)}
                              >
                                <Text>补位</Text>
                              </View>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                )}

                <View className={styles.summary}>
                  <View className={styles.summaryItem}>
                    <Text className={styles.num}>{game.players.length}</Text>
                    <Text className={styles.label}>总人数</Text>
                  </View>
                  <View className={styles.summaryItem}>
                    <Text className={styles.num checked}>{checkedCount}</Text>
                    <Text className={styles.label}>已到店</Text>
                  </View>
                  <View className={styles.summaryItem}>
                    <Text className={styles.num}>{uncheckedCount}</Text>
                    <Text className={styles.label}>未到店</Text>
                  </View>
                  <View className={styles.summaryItem}>
                    <Text className={styles.num waitlist}>{game.waitlist.length}</Text>
                    <Text className={styles.label}>候补</Text>
                  </View>
                </View>
              </View>
            );
          })
        ) : (
          <EmptyState 
            title="今日无场次"
            description="好好休息一下吧~"
            icon="🎯"
          />
        )}
      </View>
    </View>
  );
};

export default CheckinPage;
