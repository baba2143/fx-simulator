import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Hint, HintType, HintPriority } from '../../store/slices/hintSlice';
import { formatTime } from '../../utils/formatters';

interface HintCardProps {
  hint: Hint;
  onAction?: (hint: Hint) => void;
  onDismiss: (hintId: string) => void;
  onRead: (hintId: string) => void;
  style?: any;
}

const HINT_TYPE_CONFIG: {
  [key in HintType]: {
    icon: string;
    title: string;
    color: string;
  };
} = {
  trading_signal: {
    icon: 'chart-line',
    title: 'トレーディングシグナル',
    color: '#4CAF50',
  },
  risk_warning: {
    icon: 'alert-triangle',
    title: 'リスク警告',
    color: '#F44336',
  },
  market_insight: {
    icon: 'lightbulb',
    title: 'マーケット分析',
    color: '#2196F3',
  },
  technique_tip: {
    icon: 'school',
    title: 'テクニカル分析のコツ',
    color: '#FF9800',
  },
  goal_progress: {
    icon: 'flag',
    title: '目標進捗',
    color: '#9C27B0',
  },
  performance_improvement: {
    icon: 'trending-up',
    title: 'パフォーマンス向上',
    color: '#00BCD4',
  },
};

const PRIORITY_CONFIG: {
  [key in HintPriority]: {
    color: string;
    backgroundColor: string;
    borderColor: string;
  };
} = {
  critical: {
    color: '#F44336',
    backgroundColor: '#F4433620',
    borderColor: '#F44336',
  },
  high: {
    color: '#FF9800',
    backgroundColor: '#FF980020',
    borderColor: '#FF9800',
  },
  medium: {
    color: '#2196F3',
    backgroundColor: '#2196F320',
    borderColor: '#2196F3',
  },
  low: {
    color: '#4CAF50',
    backgroundColor: '#4CAF5020',
    borderColor: '#4CAF50',
  },
};

export const HintCard: React.FC<HintCardProps> = ({
  hint,
  onAction,
  onDismiss,
  onRead,
  style,
}) => {
  const [fadeAnim] = React.useState(new Animated.Value(0));
  const typeConfig = HINT_TYPE_CONFIG[hint.type];
  const priorityConfig = PRIORITY_CONFIG[hint.priority];

  React.useEffect(() => {
    Animated.fadeIn(fadeAnim).start();

    // ヒントを読んだことをマーク
    if (!hint.isRead) {
      setTimeout(() => {
        onRead(hint.id);
      }, 2000); // 2秒後に自動的に既読にマーク
    }
  }, [fadeAnim, hint.id, hint.isRead, onRead]);

  const handleAction = () => {
    if (onAction && hint.isActionable) {
      onAction(hint);
    }
  };

  const handleDismiss = () => {
    Animated.fadeOut(fadeAnim).start(() => {
      onDismiss(hint.id);
    });
  };

  const isExpired = hint.expiresAt && hint.expiresAt <= Date.now();
  const isUrgent = hint.priority === 'critical' || hint.priority === 'high';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: priorityConfig.backgroundColor,
          borderColor: priorityConfig.borderColor,
          opacity: fadeAnim,
        },
        isExpired && styles.expired,
        style,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.typeSection}>
          <Icon
            name={typeConfig.icon}
            size={20}
            color={typeConfig.color}
          />
          <Text style={[styles.typeTitle, { color: typeConfig.color }]}>
            {typeConfig.title}
          </Text>
        </View>

        <View style={styles.rightSection}>
          {isUrgent && (
            <View style={styles.urgentBadge}>
              <Icon name="alert" size={12} color={priorityConfig.color} />
              <Text style={[styles.urgentText, { color: priorityConfig.color }]}>
                {hint.priority === 'critical' ? '重要' : '高'}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.dismissButton}
            onPress={handleDismiss}
          >
            <Icon name="close" size={16} color="#B0B0B0" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{hint.title}</Text>
        <Text style={styles.message}>{hint.message}</Text>

        {hint.metadata?.confidence && (
          <View style={styles.confidenceSection}>
            <Icon name="target" size={14} color="#B0B0B0" />
            <Text style={styles.confidenceText}>
              信頼度: {hint.metadata.confidence}%
            </Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.timestamp}>
            {formatTime(hint.createdAt)}
          </Text>

          {hint.expiresAt && (
            <Text style={[
              styles.expiryText,
              isExpired && styles.expiredText
            ]}>
              {isExpired ? '期限切れ' : `期限: ${formatTime(hint.expiresAt)}`}
            </Text>
          )}
        </View>

        {hint.isActionable && hint.actionText && !isExpired && (
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: priorityConfig.color }
            ]}
            onPress={handleAction}
          >
            <Icon name="arrow-right" size={16} color="#FFF" />
            <Text style={styles.actionText}>{hint.actionText}</Text>
          </TouchableOpacity>
        )}
      </View>

      {hint.metadata?.currencyPair && (
        <View style={styles.metadataSection}>
          <Icon name="currency-usd" size={12} color="#B0B0B0" />
          <Text style={styles.metadataText}>
            {hint.metadata.currencyPair}
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    borderWidth: 1,
    margin: 8,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  expired: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#33333380',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  urgentText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  dismissButton: {
    padding: 4,
  },
  content: {
    gap: 8,
  },
  title: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  message: {
    color: '#E0E0E0',
    fontSize: 14,
    lineHeight: 20,
  },
  confidenceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  confidenceText: {
    color: '#B0B0B0',
    fontSize: 12,
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  timestamp: {
    color: '#666',
    fontSize: 11,
  },
  expiryText: {
    color: '#666',
    fontSize: 11,
  },
  expiredText: {
    color: '#F44336',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  actionText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  metadataSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  metadataText: {
    color: '#B0B0B0',
    fontSize: 11,
    marginLeft: 4,
  },
});