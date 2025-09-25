import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { setTimeframe, Timeframe } from '../../store/slices/chartSlice';

const timeframes: { label: string; value: Timeframe }[] = [
  { label: '1H', value: '1H' },
  { label: '4H', value: '4H' },
  { label: '1D', value: '1D' },
];

export const TimeframeSelector: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { timeframe, loading } = useSelector((state: RootState) => state.chart);

  const handleTimeframePress = (selectedTimeframe: Timeframe) => {
    if (selectedTimeframe !== timeframe && !loading) {
      dispatch(setTimeframe(selectedTimeframe));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>時間足</Text>
      <View style={styles.buttonContainer}>
        {timeframes.map(tf => (
          <TouchableOpacity
            key={tf.value}
            style={[
              styles.button,
              timeframe === tf.value && styles.activeButton,
              loading && styles.disabledButton,
            ]}
            onPress={() => handleTimeframePress(tf.value)}
            disabled={loading}>
            <Text style={[styles.buttonText, timeframe === tf.value && styles.activeButtonText]}>
              {tf.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#2C2C2E',
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-around',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#3C3C3E',
    minWidth: 60,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#007AFF',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  activeButtonText: {
    fontWeight: '600',
  },
});
