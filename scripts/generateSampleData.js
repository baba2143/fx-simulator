#!/usr/bin/env node

/**
 * デモ用のサンプル為替データを生成するスクリプト
 * HistDataが利用できない場合の代替として使用
 * 使用方法: node scripts/generateSampleData.js
 */

const fs = require('fs');
const path = require('path');

// 設定
const CONFIG = {
  currencyPairs: [
    { symbol: 'USDJPY', basePrice: 110.0, volatility: 0.5 },
    { symbol: 'EURUSD', basePrice: 1.18, volatility: 0.003 },
    { symbol: 'EURJPY', basePrice: 130.0, volatility: 0.6 },
    { symbol: 'GBPUSD', basePrice: 1.38, volatility: 0.004 },
    { symbol: 'GBPJPY', basePrice: 152.0, volatility: 0.7 },
    { symbol: 'AUDJPY', basePrice: 82.0, volatility: 0.4 },
    { symbol: 'XAUJPY', basePrice: 195000.0, volatility: 2000.0 }, // ゴールド/円 (1オンス)
    { symbol: 'XAUUSD', basePrice: 1850.0, volatility: 15.0 }, // ゴールド/ドル (1オンス)
  ],

  // 生成するデータの期間
  startDate: new Date('2021-01-01'),
  endDate: new Date('2024-01-31'),

  // 出力ディレクトリ
  outputDir: {
    android: path.join(__dirname, '../android/app/src/main/assets/data'),
    ios: path.join(__dirname, '../ios/FXSimulator/data'),
  },
};

// ディレクトリ作成
const ensureDirectoryExists = dirPath => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dirPath}`);
  }
};

/**
 * ランダムウォーク with トレンドとシーズナリティ
 */
const generateRealisticPrice = (basePrice, volatility, dayIndex, totalDays) => {
  // 長期トレンド（緩やかな上昇または下降）
  const trend = Math.sin((dayIndex * 2 * Math.PI) / (totalDays / 2)) * volatility * 10;

  // 短期変動
  const shortTermVolatility = (Math.random() - 0.5) * volatility * 2;

  // 週次パターン（月曜日に動きが大きい）
  const dayOfWeek = dayIndex % 7;
  const weeklyPattern = dayOfWeek === 1 ? volatility * 1.5 : volatility;

  // 価格計算
  const randomChange = (Math.random() - 0.5) * weeklyPattern;
  const price = basePrice + trend + shortTermVolatility + randomChange;

  return price;
};

/**
 * OHLC（始値・高値・安値・終値）データを生成
 */
const generateOHLC = (basePrice, volatility) => {
  const open = basePrice;
  const change = (Math.random() - 0.5) * volatility * 2;
  const close = basePrice + change;

  // 高値・安値は始値と終値の間で変動
  const intraDayVolatility = Math.random() * volatility;
  const high = Math.max(open, close) + Math.abs(intraDayVolatility);
  const low = Math.min(open, close) - Math.abs(intraDayVolatility);

  return { open, high, low, close };
};

/**
 * 通貨ペアのデータを生成
 */
const generatePairData = pair => {
  console.log(`💱 Generating data for ${pair.symbol}...`);

  const startDate = new Date(CONFIG.startDate);
  const endDate = new Date(CONFIG.endDate);
  const dayCount = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));

  let currentPrice = pair.basePrice;
  const data = [];

  for (let i = 0; i <= dayCount; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + i);

    // 週末はスキップ（FX市場は土日休み）
    if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
      continue;
    }

    // 価格を生成
    currentPrice = generateRealisticPrice(currentPrice, pair.volatility, i, dayCount);
    const ohlc = generateOHLC(currentPrice, pair.volatility);

    // 日付フォーマット（YYYYMMDD）
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;

    // CSVフォーマット
    const csvLine = `${dateStr},${ohlc.open.toFixed(6)},${ohlc.high.toFixed(6)},${ohlc.low.toFixed(
      6,
    )},${ohlc.close.toFixed(6)}`;
    data.push(csvLine);

    // 次の日の始値は前日の終値
    currentPrice = ohlc.close;
  }

  console.log(`✅ Generated ${data.length} daily records`);

  // ヘッダーを追加
  const csvContent = `Date,Open,High,Low,Close\n${data.join('\n')}`;

  return csvContent;
};

/**
 * メイン処理
 */
const main = () => {
  console.log('🎯 Sample Data Generator for FX Simulator');
  console.log('==========================================\n');

  // ディレクトリ作成
  Object.values(CONFIG.outputDir).forEach(ensureDirectoryExists);

  // 各通貨ペアのデータを生成
  CONFIG.currencyPairs.forEach(pair => {
    const csvContent = generatePairData(pair);

    // Android用に保存
    const androidPath = path.join(CONFIG.outputDir.android, `${pair.symbol}_daily.csv`);
    fs.writeFileSync(androidPath, csvContent);
    console.log(`  📱 Saved to Android: ${androidPath}`);

    // iOS用に保存
    const iosPath = path.join(CONFIG.outputDir.ios, `${pair.symbol}_daily.csv`);
    fs.writeFileSync(iosPath, csvContent);
    console.log(`  🍎 Saved to iOS: ${iosPath}`);

    console.log('');
  });

  // 統計情報を表示
  console.log('📊 Generation Summary:');
  console.log('======================');
  console.log(`  Period: ${CONFIG.startDate.toDateString()} - ${CONFIG.endDate.toDateString()}`);
  console.log(`  Currency Pairs: ${CONFIG.currencyPairs.length}`);

  const samplePath = path.join(
    CONFIG.outputDir.android,
    `${CONFIG.currencyPairs[0].symbol}_daily.csv`,
  );
  const lines = fs.readFileSync(samplePath, 'utf8').split('\n').length - 1; // ヘッダーを除く
  console.log(`  Records per pair: ~${lines}`);
  console.log(`  Total records: ~${lines * CONFIG.currencyPairs.length}`);

  console.log('\n✨ Sample data generation completed!');
  console.log('You can now run the app with demo data.');
};

// エラーハンドリング
process.on('unhandledRejection', error => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

// 実行
main();
