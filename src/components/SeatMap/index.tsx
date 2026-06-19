import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';
import { Seat, Player } from '@/types/game';

interface SeatMapProps {
  seats: Seat[];
  players: Player[];
  onSeatClick?: (seat: Seat) => void;
  selectedSeatNumber?: number;
  showLabels?: boolean;
}

const SeatMap: React.FC<SeatMapProps> = ({ seats, players, onSeatClick, selectedSeatNumber, showLabels = true }) => {
  const getPlayerBySeat = (seat: Seat): Player | undefined => {
    if (!seat.playerId) return undefined;
    return players.find(p => p.id === seat.playerId);
  };

  const rows: Seat[][] = [];
  const total = seats.length;
  if (total <= 5) {
    rows.push(seats);
  } else if (total <= 6) {
    rows.push(seats.slice(0, 3));
    rows.push(seats.slice(3, 6));
  } else if (total <= 8) {
    rows.push(seats.slice(0, 4));
    rows.push(seats.slice(4, 8));
  } else {
    const perRow = Math.ceil(total / 3);
    for (let i = 0; i < total; i += perRow) {
      rows.push(seats.slice(i, Math.min(i + perRow, total)));
    }
  }

  return (
    <View className={styles.seatMap}>
      <View className={styles.table}>
        <Text className={styles.tableText}>DM</Text>
      </View>

      <View className={styles.seatsArea}>
        {rows.map((row, rowIdx) => (
          <View key={rowIdx} className={styles.seatRow}>
            {row.map(seat => {
              const player = getPlayerBySeat(seat);
              const isSelected = selectedSeatNumber === seat.number;
              const isOccupied = seat.status === 'occupied' || seat.status === 'reserved';

              return (
                <View
                  key={seat.number}
                  className={classnames(
                    styles.seatItem,
                    isOccupied && styles.occupied,
                    seat.status === 'reserved' && styles.reserved,
                    seat.status === 'available' && styles.available,
                    isSelected && styles.selected,
                    onSeatClick && seat.status === 'available' && styles.clickable
                  )}
                  onClick={() => {
                    if (onSeatClick && seat.status === 'available') {
                      onSeatClick(seat);
                    }
                  }}
                >
                  <Text className={styles.seatNum}>{seat.number}</Text>
                  {showLabels && player && (
                    <Text className={styles.seatName}>{player.name}</Text>
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </View>

      <View className={styles.legend}>
        <View className={styles.legendItem}>
          <View className={classnames(styles.legendDot, styles.available)} />
          <Text className={styles.legendText}>可选择</Text>
        </View>
        <View className={styles.legendItem}>
          <View className={classnames(styles.legendDot, styles.occupied)} />
          <Text className={styles.legendText}>已锁定</Text>
        </View>
        <View className={styles.legendItem}>
          <View className={classnames(styles.legendDot, styles.reserved)} />
          <Text className={styles.legendText}>待审核</Text>
        </View>
      </View>
    </View>
  );
};

export default SeatMap;
