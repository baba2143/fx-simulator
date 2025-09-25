import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { resetAccount } from '../store/slices/accountSlice';

export const SettingsScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data: account } = useAppSelector(state => state.account);

  const [resetAmount, setResetAmount] = useState('1000000');

  const handleResetAccount = () => {
    Alert.alert(
      'Reset Account',
      'Are you sure you want to reset your account? This will delete all trading history and reset your balance.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            const amount = parseFloat(resetAmount);
            if (isNaN(amount) || amount <= 0) {
              Alert.alert('Error', 'Please enter a valid amount');
              return;
            }
            dispatch(resetAccount(amount));
            Alert.alert('Success', 'Account has been reset');
          },
        },
      ],
    );
  };

  const renderAccountSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Account Management</Text>

      <View style={styles.accountInfo}>
        <Text style={styles.infoLabel}>Current Balance</Text>
        <Text style={styles.infoValue}>¥{account?.balance?.toLocaleString() || '0'}</Text>
      </View>

      <View style={styles.accountInfo}>
        <Text style={styles.infoLabel}>Initial Balance</Text>
        <Text style={styles.infoValue}>¥{account?.initialBalance?.toLocaleString() || '0'}</Text>
      </View>

      <View style={styles.resetContainer}>
        <Text style={styles.resetLabel}>Reset Amount</Text>
        <TextInput
          style={styles.resetInput}
          value={resetAmount}
          onChangeText={setResetAmount}
          placeholder="1000000"
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.resetButton} onPress={handleResetAccount}>
          <Text style={styles.resetButtonText}>Reset Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAppInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>App Information</Text>

      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>Version</Text>
        <Text style={styles.infoValue}>1.0.0</Text>
      </View>

      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>Developer</Text>
        <Text style={styles.infoValue}>FX Simulator Team</Text>
      </View>

      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>Data Source</Text>
        <Text style={styles.infoValue}>Historical Currency Data</Text>
      </View>
    </View>
  );

  const renderFeatures = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Features</Text>

      <View style={styles.featureList}>
        <Text style={styles.featureItem}>📊 Real-time currency charts</Text>
        <Text style={styles.featureItem}>💰 Virtual trading simulation</Text>
        <Text style={styles.featureItem}>📈 Performance analytics</Text>
        <Text style={styles.featureItem}>📋 Trading history</Text>
        <Text style={styles.featureItem}>🎯 Risk-free learning</Text>
      </View>
    </View>
  );

  const renderDisclaimer = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Disclaimer</Text>
      <Text style={styles.disclaimerText}>
        This app is for educational purposes only. All trading is simulated using historical data.
        Past performance does not guarantee future results. Please consult with a financial advisor
        before making real investment decisions.
      </Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderAccountSection()}
      {renderAppInfo()}
      {renderFeatures()}
      {renderDisclaimer()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  accountInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  resetContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#FFF3F3',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE5E5',
  },
  resetLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  resetInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  resetButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  featureList: {
    gap: 12,
  },
  featureItem: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
  },
  disclaimerText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    textAlign: 'justify',
  },
});
