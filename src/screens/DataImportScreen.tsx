import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { CSVImporter } from '../services/dataImport/CSVImporter';
import { CurrencyPair } from '../types';

const CURRENCY_PAIRS: CurrencyPair[] = ['USDJPY', 'EURUSD', 'EURJPY', 'GBPUSD', 'GBPJPY', 'AUDJPY'];

interface ImportProgress {
  pair: CurrencyPair;
  progress: number;
}

export const DataImportScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [pairProgress, setPairProgress] = useState<ImportProgress[]>(
    CURRENCY_PAIRS.map(pair => ({ pair, progress: 0 })),
  );
  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    checkAndImportData();
  }, [navigation]);

  const checkAndImportData = async () => {
    try {
      const isDataImported = await AsyncStorage.getItem('isDataImported');
      if (isDataImported === 'true') {
        navigation.replace('MainTab');
        return;
      }

      await importData();
    } catch (error) {
      console.error('Data import error:', error);
      Alert.alert('Error', 'Failed to import currency data. Please try again.');
    }
  };

  const importData = async () => {
    try {
      await CSVImporter.importAllCurrencyPairs((pair, progress) => {
        const pairIndex = CURRENCY_PAIRS.indexOf(pair);
        setCurrentPairIndex(pairIndex);

        setPairProgress(prev =>
          prev.map((p, index) => (index === pairIndex ? { ...p, progress } : p)),
        );

        // 全体の進捗を計算
        const totalProgress = pairIndex * 100 + progress;
        const overall = Math.min(totalProgress / CURRENCY_PAIRS.length, 100);
        setOverallProgress(overall);
      });

      await AsyncStorage.setItem('isDataImported', 'true');
      navigation.replace('MainTab');
    } catch (error) {
      throw error;
    }
  };

  const ProgressBar = ({ progress }: { progress: number }) => {
    return (
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Importing Currency Data...</Text>

      <View style={styles.overallProgressContainer}>
        <Text style={styles.overallProgressText}>
          Overall Progress: {Math.round(overallProgress)}%
        </Text>
        <ProgressBar progress={overallProgress} />
      </View>

      <View style={styles.pairContainer}>
        {pairProgress.map((item, index) => (
          <View key={item.pair} style={styles.pairItem}>
            <Text
              style={[
                styles.pairText,
                index === currentPairIndex && styles.currentPairText,
                item.progress === 100 && styles.completedPairText,
              ]}>
              {item.pair}: {Math.round(item.progress)}%
            </Text>
            <ProgressBar progress={item.progress} />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  overallProgressContainer: {
    marginBottom: 40,
  },
  overallProgressText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
    color: '#007AFF',
  },
  pairContainer: {
    gap: 15,
  },
  pairItem: {
    marginBottom: 10,
  },
  pairText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#666',
  },
  currentPairText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  completedPairText: {
    color: '#34C759',
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
});
