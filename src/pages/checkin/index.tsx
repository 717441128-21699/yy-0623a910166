import React, { useState } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import EmptyState from '@/components/EmptyState';
import StatusBadge from '@/components/StatusBadge';
import { getTodayGames, mockGames } from '@/data/mockData';
import { Game, Player } from '@/types/game';

const CheckinPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'today' | 'all'>('today');
  const [checkedPlayers, setCheckedPlayers] = useState<string[]>(['p1', 'p2']);

  const games = activeTab === 'today' ? getTodayGames() : mockGames;

  const handleCheckIn = (playerId: string) => {
    Taro.showModal({
      title: '确认签到',
      content: '确认该玩家已到店？',
      confirmText: '确认签到',
      confirmColor: '#7B2CBF',
      success: (res) => {
        if (res.confirm) {
          setCheckedPlayers(prev => [...prev, playerId]);
          Taro.showToast({ title: '签到成功', icon: 'success' });
        }
      }
    });
  };

  const handlePromote = (player: Player, game: Game) => {
    Taro.showModal({
      title: '候补补位',
      content: `是否将 ${player.name} 补位到 ${game.name}？`,
      confirmText: '确认补位',
      confirmColor: '#E6B42F',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '补位成功', icon: 'success' });
        }
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
        {games.length > 0 ? (
          games.map(game => (
            <View key={game.id} className={styles.gameCard}>
              <View className={styles.gameHeader}>
                <View className={styles.gameInfo}>
                  <Text className={styles.gameName}>{game.name}</Text>
                  <Text className={styles.gameMeta}>
                    {game.date} {game.time} · {game.duration}h · {game.playerConfig}
                  </Text>
                </View>
                <View className={styles.dm}>
                  <Text>{game.dm}</Text>
                </View>
              </View>

              <View className={styles.playerList}>
                {game.players.map(player => (
                  <View key={player.id} className={styles.playerItem}>
                    <Image 
                      className={styles.playerAvatar} 
                      src={player.avatar} 
                      mode="aspectFill"
                    />
                    <View className={styles.playerDetail}>
                      <Text className={styles.playerName}>{player.name}</Text>
                      <View className={styles.playerTags}>
                        {player.tags.slice(0, 2).map((tag, idx) => (
                          <Text key={idx} className={styles.playerTag}>{tag}</Text>
                        ))}
                      </View>
                    </View>
                    <View className={styles.status}>
                      {checkedPlayers.includes(player.id) ? (
                        <Text className={styles.checked}>✓ 已签到</Text>
                      ) : (
                        <View 
                          className={styles.checkBtn}
                          onClick={() => handleCheckIn(player.id)}
                        >
                          <Text>签到</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}

                {game.waitlist.length > 0 && (
                  <>
                    <View className={styles.sectionTitle}>
                      <Text className={styles.title}>候补名单</Text>
                      <Text className={styles.count}>{game.waitlist.length}人</Text>
                    </View>
                    {game.waitlist.map(player => (
                      <View key={player.id} className={styles.waitlistItem}>
                        <Image 
                          className={styles.playerAvatar} 
                          src={player.avatar} 
                          mode="aspectFill"
                        />
                        <View className={styles.playerDetail}>
                          <Text className={styles.playerName}>{player.name}</Text>
                          <View className={styles.playerTags}>
                            {player.tags.slice(0, 2).map((tag, idx) => (
                              <Text key={idx} className={styles.playerTag}>{tag}</Text>
                            ))}
                          </View>
                        </View>
                        <View 
                          className={styles.promoteBtn}
                          onClick={() => handlePromote(player, game)}
                        >
                          <Text>补位</Text>
                        </View>
                      </View>
                    ))}
                  </>
                )}
              </View>

              <View className={styles.summary}>
                <View className={styles.summaryItem}>
                  <Text className={styles.num}>{game.players.length}</Text>
                  <Text className={styles.label}>总人数</Text>
                </View>
                <View className={styles.summaryItem}>
                  <Text className={styles.num}>{checkedPlayers.filter(id => game.players.some(p => p.id === id)).length}</Text>
                  <Text className={styles.label}>已签到</Text>
                </View>
                <View className={styles.summaryItem}>
                  <Text className={styles.num}>{game.waitlist.length}</Text>
                  <Text className={styles.label}>候补</Text>
                </View>
              </View>
            </View>
          ))
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
