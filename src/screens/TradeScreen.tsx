import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { createTrade, fetchOpenTrades } from '../store/slices/tradeSlice';
import { fetchAccount } from '../store/slices/accountSlice';
import { CurrencyPair, TradeType } from '../types';

const CURRENCY_PAIRS: CurrencyPair[] = ['USDJPY', 'EURUSD', 'EURJPY', 'GBPUSD', 'GBPJPY', 'AUDJPY'];

export const TradeScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { openTrades, loading } = useAppSelector(state => state.trade);
  const { data: account } = useAppSelector(state => state.account);

  const [selectedPair, setSelectedPair] = useState<CurrencyPair>('USDJPY');
  const [selectedType, setSelectedType] = useState<TradeType>('buy');
  const [amount, setAmount] = useState('100000');
  const [price, setPrice] = useState('150.00');

  useEffect(() => {
    dispatch(fetchAccount());
    dispatch(fetchOpenTrades());
  }, [dispatch]);

  const handleTrade = async () => {
    try {
      const tradeAmount = parseFloat(amount);
      const tradePrice = parseFloat(price);

      if (isNaN(tradeAmount) || isNaN(tradePrice) || tradeAmount <= 0 || tradePrice <= 0) {
        Alert.alert('Error', 'Please enter valid amount and price');
        return;
      }

      if (!account) {
        Alert.alert('Error', 'Account data not available');
        return;
      }

      // バランスチェックは簡略化（本来はレバレッジ計算が必要）
      if (tradeAmount > account.balance) {
        Alert.alert('Error', 'Insufficient balance');
        return;
      }

      await dispatch(
        createTrade({
          currencyPair: selectedPair,
          tradeType: selectedType,
          amount: tradeAmount,
          price: tradePrice,
        }),
      ).unwrap();

      Alert.alert('Success', 'Trade created successfully');
      dispatch(fetchOpenTrades());
      dispatch(fetchAccount());
    } catch (error) {
      Alert.alert('Error', 'Failed to create trade');
    }
  };

  const renderPairSelector = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Currency Pair</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {CURRENCY_PAIRS.map(pair => (
          <TouchableOpacity
            key={pair}
            style={[styles.pairButton, pair === selectedPair && styles.activePairButton]}
            onPress={() => setSelectedPair(pair)}>
            <Text
              style={[styles.pairButtonText, pair === selectedPair && styles.activePairButtonText]}>
              {pair}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderTradeTypeSelector = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Trade Type</Text>
      <View style={styles.tradeTypeContainer}>
        <TouchableOpacity
          style={[styles.tradeTypeButton, selectedType === 'buy' && styles.buyButton]}
          onPress={() => setSelectedType('buy')}>
          <Text
            style={[styles.tradeTypeButtonText, selectedType === 'buy' && styles.buyButtonText]}>
            BUY
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tradeTypeButton, selectedType === 'sell' && styles.sellButton]}
          onPress={() => setSelectedType('sell')}>
          <Text
            style={[styles.tradeTypeButtonText, selectedType === 'sell' && styles.sellButtonText]}>
            SELL
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTradeInputs = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Trade Details</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Amount</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          placeholder="100000"
          keyboardType="numeric"
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Price</Text>
        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          placeholder="150.00"
          keyboardType="numeric"
        />
      </View>
    </View>
  );

  const renderAccountInfo = () => (
    <View style={styles.accountContainer}>
      <Text style={styles.accountTitle}>Account Balance</Text>
      <Text style={styles.accountBalance}>¥{account?.balance?.toLocaleString() || '0'}</Text>
    </View>
  );

  const renderOpenTrades = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Open Positions ({openTrades.length})</Text>
      {openTrades.length === 0 ? (
        <Text style={styles.noTradesText}>No open positions</Text>
      ) : (
        <ScrollView style={styles.tradesContainer}>
          {openTrades.map(trade => (
            <View key={trade.id} style={styles.tradeItem}>
              <Text style={styles.tradeInfo}>
                {trade.currencyPair} - {trade.tradeType.toUpperCase()}
              </Text>
              <Text style={styles.tradeAmount}>Amount: {trade.amount.toLocaleString()}</Text>
              <Text style={styles.tradePrice}>Price: {trade.openPrice}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {renderAccountInfo()}
      {renderPairSelector()}
      {renderTradeTypeSelector()}
      {renderTradeInputs()}

      <TouchableOpacity
        style={[styles.tradeButton, loading && styles.disabledButton]}
        onPress={handleTrade}
        disabled={loading}>
        <Text style={styles.tradeButtonText}>{loading ? 'Processing...' : 'Execute Trade'}</Text>
      </TouchableOpacity>

      {renderOpenTrades()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  accountContainer: {
    padding: 16,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
  },
  accountTitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 4,
  },
  accountBalance: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  sectionContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  pairButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  activePairButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  pairButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  activePairButtonText: {
    color: '#FFFFFF',
  },
  tradeTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  tradeTypeButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E5EA',
  },
  buyButton: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  sellButton: {
    backgroundColor: '#FF3B30',
    borderColor: '#FF3B30',
  },
  tradeTypeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  buyButtonText: {
    color: '#FFFFFF',
  },
  sellButtonText: {
    color: '#FFFFFF',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  tradeButton: {
    margin: 16,
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#C7C7CC',
  },
  tradeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  noTradesText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666666',
    fontStyle: 'italic',
  },
  tradesContainer: {
    maxHeight: 200,
  },
  tradeItem: {
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  tradeInfo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  tradeAmount: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  tradePrice: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
});
