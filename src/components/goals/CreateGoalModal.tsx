import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Goal, GoalType } from '../../store/slices/goalSlice';
import { formatCurrency } from '../../utils/formatters';

interface CreateGoalModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (goal: Omit<Goal, 'id' | 'createdAt' | 'currentAmount'>) => void;
  editingGoal?: Goal;
}

const { width, height } = Dimensions.get('window');

const GOAL_TYPES: { type: GoalType; title: string; icon: string; color: string; description: string }[] = [
  {
    type: 'daily',
    title: '日次目標',
    icon: 'calendar-today',
    color: '#FF6B6B',
    description: '1日で達成する利益目標',
  },
  {
    type: 'weekly',
    title: '週次目標',
    icon: 'calendar-week',
    color: '#4ECDC4',
    description: '1週間で達成する利益目標',
  },
  {
    type: 'monthly',
    title: '月次目標',
    icon: 'calendar-month',
    color: '#45B7D1',
    description: '1ヶ月で達成する利益目標',
  },
];

const PRESET_AMOUNTS = [1000, 5000, 10000, 25000, 50000, 100000];

export const CreateGoalModal: React.FC<CreateGoalModalProps> = ({
  visible,
  onClose,
  onSave,
  editingGoal,
}) => {
  const [selectedType, setSelectedType] = useState<GoalType>(editingGoal?.type || 'daily');
  const [targetAmount, setTargetAmount] = useState(editingGoal?.targetAmount.toString() || '');
  const [description, setDescription] = useState(editingGoal?.description || '');

  const getEndDate = (type: GoalType, startDate: Date = new Date()) => {
    const date = new Date(startDate);
    switch (type) {
      case 'daily':
        date.setHours(23, 59, 59, 999);
        return date.getTime();
      case 'weekly':
        date.setDate(date.getDate() + 7);
        date.setHours(23, 59, 59, 999);
        return date.getTime();
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        date.setHours(23, 59, 59, 999);
        return date.getTime();
      default:
        return date.getTime();
    }
  };

  const handleSave = () => {
    const amount = parseFloat(targetAmount);

    if (!targetAmount || isNaN(amount) || amount <= 0) {
      Alert.alert('エラー', '有効な目標金額を入力してください');
      return;
    }

    if (amount > 1000000) {
      Alert.alert('エラー', '目標金額は100万円以下で設定してください');
      return;
    }

    const startDate = editingGoal ? editingGoal.startDate : Date.now();
    const endDate = editingGoal ? editingGoal.endDate : getEndDate(selectedType);

    const goalData: Omit<Goal, 'id' | 'createdAt' | 'currentAmount'> = {
      type: selectedType,
      targetAmount: amount,
      startDate,
      endDate,
      status: editingGoal?.status || 'active',
      description: description.trim() || undefined,
      completedAt: editingGoal?.completedAt,
    };

    onSave(goalData);
    handleClose();
  };

  const handleClose = () => {
    setSelectedType('daily');
    setTargetAmount('');
    setDescription('');
    onClose();
  };

  const handlePresetAmount = (amount: number) => {
    setTargetAmount(amount.toString());
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {editingGoal ? '目標を編集' : '新しい目標を作成'}
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>目標期間</Text>
              <View style={styles.typeOptions}>
                {GOAL_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.type}
                    style={[
                      styles.typeOption,
                      selectedType === type.type && {
                        borderColor: type.color,
                        backgroundColor: `${type.color}20`,
                      },
                    ]}
                    onPress={() => setSelectedType(type.type)}
                  >
                    <Icon
                      name={type.icon}
                      size={24}
                      color={selectedType === type.type ? type.color : '#B0B0B0'}
                    />
                    <Text
                      style={[
                        styles.typeTitle,
                        selectedType === type.type && { color: type.color },
                      ]}
                    >
                      {type.title}
                    </Text>
                    <Text style={styles.typeDescription}>{type.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>目標金額</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.currencySymbol}>¥</Text>
                <TextInput
                  style={styles.amountInput}
                  value={targetAmount}
                  onChangeText={setTargetAmount}
                  placeholder="10000"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                />
              </View>

              <Text style={styles.presetTitle}>プリセット金額</Text>
              <View style={styles.presetAmounts}>
                {PRESET_AMOUNTS.map((amount) => (
                  <TouchableOpacity
                    key={amount}
                    style={[
                      styles.presetButton,
                      targetAmount === amount.toString() && styles.presetButtonSelected,
                    ]}
                    onPress={() => handlePresetAmount(amount)}
                  >
                    <Text
                      style={[
                        styles.presetButtonText,
                        targetAmount === amount.toString() && styles.presetButtonTextSelected,
                      ]}
                    >
                      {formatCurrency(amount)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>説明（任意）</Text>
              <TextInput
                style={styles.descriptionInput}
                value={description}
                onChangeText={setDescription}
                placeholder="目標の詳細や理由を入力..."
                placeholderTextColor="#666"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.summary}>
              <Text style={styles.summaryTitle}>目標サマリー</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>期間:</Text>
                <Text style={styles.summaryValue}>
                  {GOAL_TYPES.find(t => t.type === selectedType)?.title}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>目標額:</Text>
                <Text style={styles.summaryValue}>
                  {targetAmount ? formatCurrency(parseFloat(targetAmount)) : '未設定'}
                </Text>
              </View>
              {description && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>説明:</Text>
                  <Text style={styles.summaryValue}>{description}</Text>
                </View>
              )}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>
                {editingGoal ? '更新' : '作成'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#1E1E1E',
    width: width * 0.9,
    maxHeight: height * 0.9,
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    maxHeight: height * 0.6,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  typeOptions: {
    gap: 12,
  },
  typeOption: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  typeDescription: {
    color: '#B0B0B0',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 50,
  },
  currencySymbol: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  presetTitle: {
    color: '#B0B0B0',
    fontSize: 14,
    marginTop: 16,
    marginBottom: 8,
  },
  presetAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetButton: {
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  presetButtonSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#4CAF5020',
  },
  presetButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  presetButtonTextSelected: {
    color: '#4CAF50',
  },
  descriptionInput: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 16,
    color: '#FFF',
    fontSize: 16,
    minHeight: 80,
  },
  summary: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  summaryTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    color: '#B0B0B0',
    fontSize: 14,
  },
  summaryValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#666',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});