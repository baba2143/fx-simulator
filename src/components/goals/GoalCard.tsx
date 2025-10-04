import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Goal, GoalType } from '../../store/slices/goalSlice';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { ProgressBar } from './ProgressBar';

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (goalId: string) => void;
  onPause: (goalId: string) => void;
  onResume: (goalId: string) => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

const GOAL_TYPE_CONFIG = {
  daily: {
    icon: 'calendar-today',
    color: '#FF6B6B',
    title: '日次目標',
    duration: '1日',
  },
  weekly: {
    icon: 'calendar-week',
    color: '#4ECDC4',
    title: '週次目標',
    duration: '1週間',
  },
  monthly: {
    icon: 'calendar-month',
    color: '#45B7D1',
    title: '月次目標',
    duration: '1ヶ月',
  },
};

const STATUS_CONFIG = {
  active: {
    color: '#4CAF50',
    text: 'アクティブ',
    icon: 'play-circle',
  },
  completed: {
    color: '#2196F3',
    text: '達成',
    icon: 'check-circle',
  },
  failed: {
    color: '#F44336',
    text: '失敗',
    icon: 'close-circle',
  },
  paused: {
    color: '#FF9800',
    text: '一時停止',
    icon: 'pause-circle',
  },
};

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onEdit,
  onDelete,
  onPause,
  onResume,
}) => {
  const config = GOAL_TYPE_CONFIG[goal.type];
  const statusConfig = STATUS_CONFIG[goal.status];
  const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
  const progressClamped = Math.max(0, Math.min(100, progress));

  const remainingTime = goal.endDate - Date.now();
  const isExpired = remainingTime <= 0 && goal.status === 'active';
  const daysRemaining = Math.ceil(remainingTime / (1000 * 60 * 60 * 24));

  const handleDelete = () => {
    Alert.alert('目標を削除', 'この目標を削除してもよろしいですか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: () => onDelete(goal.id),
      },
    ]);
  };

  const handlePauseResume = () => {
    if (goal.status === 'active') {
      onPause(goal.id);
    } else if (goal.status === 'paused') {
      onResume(goal.id);
    }
  };

  return (
    <View style={[styles.card, { borderLeftColor: config.color }]}>
      <View style={styles.header}>
        <View style={styles.typeSection}>
          <Icon name={config.icon} size={24} color={config.color} />
          <Text style={[styles.typeTitle, { color: config.color }]}>{config.title}</Text>
        </View>
        <View style={styles.statusSection}>
          <Icon name={statusConfig.icon} size={20} color={statusConfig.color} />
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.text}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.amountSection}>
          <Text style={styles.targetLabel}>目標金額</Text>
          <Text style={styles.targetAmount}>{formatCurrency(goal.targetAmount)}</Text>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.currentAmount}>現在: {formatCurrency(goal.currentAmount)}</Text>
            <Text
              style={[styles.progressPercentage, { color: progress >= 100 ? '#4CAF50' : '#FFF' }]}>
              {formatPercentage(progress)}
            </Text>
          </View>
          <ProgressBar
            progress={progressClamped}
            color={progress >= 100 ? '#4CAF50' : config.color}
            height={8}
          />
        </View>

        {goal.description && <Text style={styles.description}>{goal.description}</Text>}

        <View style={styles.timeSection}>
          {goal.status === 'active' && (
            <Text
              style={[
                styles.timeRemaining,
                { color: isExpired ? '#F44336' : daysRemaining <= 1 ? '#FF9800' : '#B0B0B0' },
              ]}>
              {isExpired ? '期限切れ' : daysRemaining > 0 ? `残り${daysRemaining}日` : '本日終了'}
            </Text>
          )}
          {goal.completedAt && (
            <Text style={styles.completedDate}>
              達成日: {new Date(goal.completedAt).toLocaleDateString('ja-JP')}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        {(goal.status === 'active' || goal.status === 'paused') && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
            onPress={handlePauseResume}>
            <Icon name={goal.status === 'active' ? 'pause' : 'play'} size={18} color="#FFF" />
            <Text style={styles.actionText}>{goal.status === 'active' ? '一時停止' : '再開'}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
          onPress={() => onEdit(goal)}>
          <Icon name="pencil" size={18} color="#FFF" />
          <Text style={styles.actionText}>編集</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#F44336' }]}
          onPress={handleDelete}>
          <Icon name="delete" size={18} color="#FFF" />
          <Text style={styles.actionText}>削除</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  typeSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  content: {
    marginBottom: 16,
  },
  amountSection: {
    marginBottom: 16,
  },
  targetLabel: {
    color: '#B0B0B0',
    fontSize: 14,
    marginBottom: 4,
  },
  targetAmount: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  currentAmount: {
    color: '#B0B0B0',
    fontSize: 16,
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  description: {
    color: '#B0B0B0',
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  timeSection: {
    marginTop: 8,
  },
  timeRemaining: {
    fontSize: 14,
    fontWeight: '600',
  },
  completedDate: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  actionText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});
