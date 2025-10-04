#!/usr/bin/env node

/**
 * HistData.comから為替データを自動取得・変換するスクリプト
 * 使用方法: node scripts/downloadHistData.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

// 設定
const CONFIG = {
  // ダウンロード対象の通貨ペア
  currencyPairs: [
    { symbol: 'USDJPY', histDataName: 'DAT_ASCII_USDJPY_M1' },
    { symbol: 'EURUSD', histDataName: 'DAT_ASCII_EURUSD_M1' },
    { symbol: 'EURJPY', histDataName: 'DAT_ASCII_EURJPY_M1' },
    { symbol: 'GBPUSD', histDataName: 'DAT_ASCII_GBPUSD_M1' },
    { symbol: 'GBPJPY', histDataName: 'DAT_ASCII_GBPJPY_M1' },
    { symbol: 'AUDJPY', histDataName: 'DAT_ASCII_AUDJPY_M1' },
  ],

  // 取得する年範囲
  startYear: 2021,
  endYear: 2024,

  // 出力ディレクトリ
  outputDir: {
    android: path.join(__dirname, '../android/app/src/main/assets/data'),
    ios: path.join(__dirname, '../ios/FXSimulator/data'),
    temp: path.join(__dirname, '../temp/histdata'),
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
 * HistData.comからデータをダウンロード
 * 注意: HistData.comは直接ダウンロードを制限している場合があるため、
 * ブラウザでの手動ダウンロードが必要な場合があります
 */
const downloadData = async (pair, year) => {
  const url = `http://www.histdata.com/download-free-forex-historical-data/?/ascii/1-minute-bar-quotes/${pair.histDataName.toLowerCase()}/${year}`;

  console.log(`🌐 Downloading ${pair.symbol} for ${year}...`);
  console.log(`   URL: ${url}`);

  return new Promise((resolve, reject) => {
    // 実際のダウンロードには認証が必要な場合があるため、
    // ここではダウンロードURLの提示のみ行います
    console.log(`   ⚠️  Please download manually from: ${url}`);
    console.log(`   📥 Save the ZIP file to: ${CONFIG.outputDir.temp}/${pair.symbol}_${year}.zip`);
    resolve();
  });
};

/**
 * CSVデータを日足データに変換
 */
const convertToDaily = (csvContent, currencyPair) => {
  const lines = csvContent.trim().split('\n');
  const dailyData = {};

  console.log(`📊 Converting ${lines.length} minutes data to daily...`);

  lines.forEach(line => {
    if (!line.trim()) {
      return;
    }

    // HistDataフォーマット: YYYYMMDD HHMMSS,OPEN,HIGH,LOW,CLOSE,VOL
    const parts = line.split(',');
    if (parts.length < 5) {
      return;
    }

    const [datetime, open, high, low, close, volume = '0'] = parts;
    const dateStr = datetime.split(' ')[0];

    if (!dateStr || dateStr.length !== 8) {
      return;
    }

    // 日付ごとにデータを集約
    if (!dailyData[dateStr]) {
      dailyData[dateStr] = {
        date: dateStr,
        open: parseFloat(open),
        high: parseFloat(high),
        low: parseFloat(low),
        close: parseFloat(close),
        count: 1,
      };
    } else {
      // 高値・安値を更新
      dailyData[dateStr].high = Math.max(dailyData[dateStr].high, parseFloat(high));
      dailyData[dateStr].low = Math.min(dailyData[dateStr].low, parseFloat(low));
      // 終値を最新の値に更新
      dailyData[dateStr].close = parseFloat(close);
      dailyData[dateStr].count++;
    }
  });

  // 日付順にソートして出力
  const sortedDates = Object.keys(dailyData).sort();
  const dailyCsv = sortedDates
    .map(date => {
      const data = dailyData[date];
      return `${date},${data.open.toFixed(6)},${data.high.toFixed(6)},${data.low.toFixed(
        6,
      )},${data.close.toFixed(6)}`;
    })
    .join('\n');

  console.log(`✅ Converted to ${sortedDates.length} daily records`);

  return dailyCsv;
};

/**
 * ZIPファイルを解凍
 */
const unzipFile = async (zipPath, outputPath) => {
  console.log(`📦 Unzipping ${zipPath}...`);

  try {
    // unzipコマンドを使用（macOS/Linux）
    await execPromise(`unzip -o "${zipPath}" -d "${outputPath}"`);
    console.log('✅ Unzipped successfully');
    return true;
  } catch (error) {
    console.error(`❌ Failed to unzip: ${error.message}`);
    console.log(`   Please unzip manually: ${zipPath}`);
    return false;
  }
};

/**
 * データ処理のメイン関数
 */
const processData = async () => {
  console.log('🚀 Starting HistData download and conversion process...\n');

  // ディレクトリ作成
  Object.values(CONFIG.outputDir).forEach(ensureDirectoryExists);

  // 各通貨ペアを処理
  for (const pair of CONFIG.currencyPairs) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`💱 Processing ${pair.symbol}`);
    console.log(`${'='.repeat(60)}\n`);

    let allDailyData = [];

    // 各年のデータを処理
    for (let year = CONFIG.startYear; year <= CONFIG.endYear; year++) {
      const zipPath = path.join(CONFIG.outputDir.temp, `${pair.symbol}_${year}.zip`);
      const csvPath = path.join(CONFIG.outputDir.temp, `${pair.histDataName}_${year}.csv`);

      // ZIPファイルが存在するか確認
      if (fs.existsSync(zipPath)) {
        console.log(`📌 Found ZIP file: ${zipPath}`);

        // 解凍
        const unzipped = await unzipFile(zipPath, CONFIG.outputDir.temp);

        if (unzipped && fs.existsSync(csvPath)) {
          // CSVファイルを読み込み
          const csvContent = fs.readFileSync(csvPath, 'utf8');

          // 日足データに変換
          const dailyData = convertToDaily(csvContent, pair.symbol);
          allDailyData.push(dailyData);

          // 一時CSVファイルを削除
          fs.unlinkSync(csvPath);
          console.log('🗑️  Cleaned up temporary CSV file');
        }
      } else {
        console.log(`⚠️  ZIP file not found: ${zipPath}`);
        console.log('   Please download from HistData.com first');
        await downloadData(pair, year);
      }
    }

    if (allDailyData.length > 0) {
      // 全年度のデータを結合
      const combinedData = allDailyData.join('\n');

      // ヘッダーを追加
      const finalCsv = `Date,Open,High,Low,Close\n${combinedData}`;

      // Android用に保存
      const androidPath = path.join(CONFIG.outputDir.android, `${pair.symbol}_daily.csv`);
      fs.writeFileSync(androidPath, finalCsv);
      console.log(`\n✅ Saved to Android: ${androidPath}`);

      // iOS用に保存
      const iosPath = path.join(CONFIG.outputDir.ios, `${pair.symbol}_daily.csv`);
      fs.writeFileSync(iosPath, finalCsv);
      console.log(`✅ Saved to iOS: ${iosPath}`);

      // データ統計を表示
      const lines = combinedData.split('\n').length;
      console.log(`📊 Total daily records: ${lines}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✨ Process completed!');
  console.log('='.repeat(60));
};

/**
 * 手動ダウンロード用のURLリストを生成
 */
const generateDownloadList = () => {
  console.log('\n📋 Manual Download URLs:\n');
  console.log('Please download the following files from HistData.com:\n');

  CONFIG.currencyPairs.forEach(pair => {
    console.log(`\n${pair.symbol}:`);
    for (let year = CONFIG.startYear; year <= CONFIG.endYear; year++) {
      const url = `http://www.histdata.com/download-free-forex-historical-data/?/ascii/1-minute-bar-quotes/${pair.histDataName.toLowerCase()}/${year}`;
      console.log(`  ${year}: ${url}`);
      console.log(`       Save as: ${CONFIG.outputDir.temp}/${pair.symbol}_${year}.zip`);
    }
  });

  console.log('\nAfter downloading all files, run this script again to process them.');
};

// メイン実行
const main = async () => {
  console.log('🎯 HistData.com Data Processor');
  console.log('================================\n');

  // tempディレクトリにZIPファイルがあるか確認
  ensureDirectoryExists(CONFIG.outputDir.temp);
  const tempFiles = fs.readdirSync(CONFIG.outputDir.temp);
  const zipFiles = tempFiles.filter(f => f.endsWith('.zip'));

  if (zipFiles.length === 0) {
    console.log('📭 No ZIP files found in temp directory.');
    generateDownloadList();
  } else {
    console.log(`📬 Found ${zipFiles.length} ZIP files in temp directory.`);
    console.log('Starting conversion process...\n');
    await processData();
  }
};

// エラーハンドリング
process.on('unhandledRejection', error => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

// 実行
main().catch(console.error);
