import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  Switch,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import {
  addIndicator,
  removeIndicator,
  toggleIndicatorVisibility,
  updateIndicator,
  IndicatorConfig,
  IndicatorType,
} from '../../store/slices/indicatorSlice';

interface IndicatorSettingsProps {
  visible: boolean;
  onClose: () => void;
}

const INDICATOR_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
  '#DDA0DD',
  '#98D8E8',
  '#F7DC6F',
];

const INDICATOR_PRESETS: { [key in IndicatorType]: Partial<IndicatorConfig> } = {
  sma: { period: 20 },
  ema: { period: 12 },
  rsi: { period: 14 },
  macd: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
  bollinger: { period: 20, deviation: 2 },
  stochastic: { period: 14 },
};

export const IndicatorSettings: React.FC<IndicatorSettingsProps> = ({ visible, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { activeIndicators } = useSelector((state: RootState) => state.indicators);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newIndicatorType, setNewIndicatorType] = useState<IndicatorType>('sma');
  const [newIndicatorPeriod, setNewIndicatorPeriod] = useState('20');

  const handleAddIndicator = () => {
    const colorIndex = activeIndicators.length % INDICATOR_COLORS.length;
    const baseConfig = INDICATOR_PRESETS[newIndicatorType];
    const id = `${newIndicatorType}${Date.now()}`;

    const config: IndicatorConfig = {
      id,
      type: newIndicatorType,
      visible: true,
      color: INDICATOR_COLORS[colorIndex],
      ...baseConfig,
    };

    // カスタム期間を設定
    if (newIndicatorType === 'sma' || newIndicatorType === 'ema' || newIndicatorType === 'rsi') {
      config.period = parseInt(newIndicatorPeriod, 10) || baseConfig.period || 20;
    }

    dispatch(addIndicator(config));
    setShowAddModal(false);
    setNewIndicatorPeriod('20');
  };

  const handleRemoveIndicator = (id: string) => {
    dispatch(removeIndicator(id));
  };

  const handleToggleVisibility = (id: string) => {
    dispatch(toggleIndicatorVisibility(id));
  };

  const handleColorChange = (id: string, color: string) => {
    dispatch(updateIndicator({ id, config: { color } }));
  };

  const getIndicatorDisplayName = (indicator: IndicatorConfig) => {
    const { type, period, fastPeriod, slowPeriod } = indicator;
    switch (type) {
      case 'sma':
        return `SMA(${period})`;
      case 'ema':
        return `EMA(${period})`;
      case 'rsi':
        return `RSI(${period})`;
      case 'macd':
        return `MACD(${fastPeriod},${slowPeriod})`;
      case 'bollinger':
        return `Bollinger Bands(${period})`;
      case 'stochastic':
        return `Stochastic(${period})`;
      default:
        return String(type).toUpperCase();
    }
  };

  const AddIndicatorModal = () => (
    <Modal visible={showAddModal} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>新しいインジケーターを追加</Text>

          <Text style={styles.label}>インジケータータイプ</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
            {(Object.keys(INDICATOR_PRESETS) as IndicatorType[]).map(type => (
              <TouchableOpacity
                key={type}
                style={[styles.typeButton, newIndicatorType === type && styles.selectedTypeButton]}
                onPress={() => setNewIndicatorType(type as IndicatorType)}>
                <Text
                  style={[
                    styles.typeButtonText,
                    newIndicatorType === type && styles.selectedTypeButtonText,
                  ]}>
                  {type.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {['sma', 'ema', 'rsi'].includes(newIndicatorType) && (
            <>
              <Text style={styles.label}>期間</Text>
              <TextInput
                style={styles.textInput}
                value={newIndicatorPeriod}
                onChangeText={setNewIndicatorPeriod}
                keyboardType="numeric"
                placeholder="期間を入力"
                placeholderTextColor="#8E8E93"
              />
            </>
          )}

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddModal(false)}>
              <Text style={styles.cancelButtonText}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addButton} onPress={handleAddIndicator}>
              <Text style={styles.addButtonText}>追加</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>テクニカル指標</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {activeIndicators.map(indicator => (
              <View key={indicator.id} style={styles.indicatorItem}>
                <View style={styles.indicatorInfo}>
                  <View style={styles.indicatorHeader}>
                    <View style={[styles.colorIndicator, { backgroundColor: indicator.color }]} />
                    <Text style={styles.indicatorName}>{getIndicatorDisplayName(indicator)}</Text>
                  </View>
                  <Switch
                    value={indicator.visible}
                    onValueChange={() => handleToggleVisibility(indicator.id)}
                    trackColor={{ false: '#767577', true: '#007AFF' }}
                    thumbColor={indicator.visible ? '#FFFFFF' : '#f4f3f4'}
                  />
                </View>

                <View style={styles.colorPalette}>
                  {INDICATOR_COLORS.map(color => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color },
                        indicator.color === color && styles.selectedColor,
                      ]}
                      onPress={() => handleColorChange(indicator.id, color)}
                    />
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveIndicator(indicator.id)}>
                  <Text style={styles.removeButtonText}>削除</Text>
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity style={styles.addNewButton} onPress={() => setShowAddModal(true)}>
              <Text style={styles.addNewButtonText}>+ インジケーターを追加</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      <AddIndicatorModal />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#48484A',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '300',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  indicatorItem: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  indicatorInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  indicatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  indicatorName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  colorPalette: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  colorOption: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#FFFFFF',
  },
  removeButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FF3B30',
    borderRadius: 6,
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  addNewButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  addNewButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 16,
  },
  typeSelector: {
    marginBottom: 16,
  },
  typeButton: {
    backgroundColor: '#3C3C3E',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  selectedTypeButton: {
    backgroundColor: '#007AFF',
  },
  typeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedTypeButtonText: {
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: '#3C3C3E',
    color: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#3C3C3E',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  addButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
