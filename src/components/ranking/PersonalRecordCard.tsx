import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { PersonalRecord, RankingCategory } from '../../store/slices/rankingSlice';
import { formatCurrency, formatPercentage, formatDate } from '../../utils/formatters';

interface PersonalRecordCardProps {
  record: PersonalRecord;
  isLatest?: boolean;
  onPress?: (record: PersonalRecord) => void;
}

const { width } = Dimensions.get('window');

const CATEGORY_CONFIG: { [key in RankingCategory]: { icon: string; title: string; color: string; format: (value: number) => string } } = {
  profit: {
    icon: 'trending-up',
    title: '利益',
    color: '#4CAF50',
    format: (value: number) => formatCurrency(value),
  },
  winRate: {
    icon: 'target',
    title: '勝率',
    color: '#2196F3',
    format: (value: number) => formatPercentage(value),
  },
  profitFactor: {
    icon: 'calculator-variant',
    title: 'プロフィットファクター',
    color: '#FF9800',
    format: (value: number) => `${value.toFixed(2)}`,
  },
  consistency: {
    icon: 'chart-line-variant',
    title: '一貫性スコア',
    color: '#9C27B0',
    format: (value: number) => `${value.toFixed(1)}`,
  },
  riskReward: {
    icon: 'scale-balance',
    title: 'リスクリワード',
    color: '#F44336',
    format: (value: number) => `1:${value.toFixed(2)}`,
  },
};

const PERIOD_LABELS = {
  daily: '日次',
  weekly: '週次',
  monthly: '月次',
  yearly: '年次',
  'all-time': '全期間',
};

export const PersonalRecordCard: React.FC<PersonalRecordCardProps> = ({
  record,
  isLatest = false,
  onPress,
}) => {
  const config = CATEGORY_CONFIG[record.category];

  const handlePress = () => {
    if (onPress) {
      onPress(record);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { borderLeftColor: config.color },
        isLatest && styles.latestCard,
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.categorySection}>
          <Icon name={config.icon} size={24} color={config.color} />
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryTitle}>{config.title}</Text>
            <Text style={styles.periodLabel}>
              {PERIOD_LABELS[record.period]}
            </Text>
          </View>
        </View>

        {isLatest && (
          <View style={styles.newBadge}>
            <Icon name="new-box" size={20} color="#FF6B6B" />
            <Text style={styles.newText}>NEW</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.valueSection}>
          <Text style={[styles.value, { color: config.color }]}>
            {config.format(record.value)}
          </Text>
          {record.improvement !== undefined && record.improvement > 0 && (
            <View style={styles.improvementSection}>
              <Icon name="trending-up" size={16} color="#4CAF50" />
              <Text style={styles.improvementText}>
                +{formatPercentage(record.improvement)} 向上
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.description}>{record.description}</Text>

        <View style={styles.footer}>
          <Text style={styles.date}>
            {formatDate(record.achievedAt)}
          </Text>
          {record.previousBest !== undefined && record.previousBest > 0 && (
            <Text style={styles.previousBest}>
              前回: {config.format(record.previousBest)}
            </Text>
          )}
        </View>

        {record.metadata && (
          <View style={styles.metadata}>
            {record.metadata.tradesCount && (
              <View style={styles.metadataItem}>
                <Icon name="chart-bar" size={12} color="#B0B0B0" />
                <Text style={styles.metadataText}>
                  {record.metadata.tradesCount}取引
                </Text>
              </View>
            )}
            {record.metadata.currencyPair && (
              <View style={styles.metadataItem}>
                <Icon name="currency-usd" size={12} color="#B0B0B0" />
                <Text style={styles.metadataText}>
                  {record.metadata.currencyPair}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  latestCard: {
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#FF6B6B30',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categorySection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryInfo: {
    marginLeft: 12,
    flex: 1,
  },
  categoryTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  periodLabel: {
    color: '#B0B0B0',
    fontSize: 12,
    marginTop: 2,
  },
  newBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  newText: {
    color: '#FF6B6B',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  content: {
    gap: 8,
  },
  valueSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  improvementSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF5020',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  improvementText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  description: {
    color: '#B0B0B0',
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  date: {
    color: '#666',
    fontSize: 12,
  },
  previousBest: {
    color: '#666',
    fontSize: 12,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataText: {
    color: '#B0B0B0',
    fontSize: 10,
    marginLeft: 4,
  },
});