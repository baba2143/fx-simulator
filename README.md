# FX Practice Simulator

FX初心者向けのモバイルトレーディングシミュレーターアプリです。実際の資金をリスクにさらすことなく、過去の実際の為替データを使用してFX取引の練習ができます。

## 📱 アプリの特徴

- **リスクフリー**: 仮想資金でのトレーディング練習
- **リアルデータ**: 実際の過去為替データを使用
- **包括的分析**: 詳細な成績分析とパフォーマンス追跡
- **クロスプラットフォーム**: iOS・Android対応

## 🚀 主な機能

### トレーディング機能
- 6つの主要通貨ペア（USD/JPY, EUR/USD, EUR/JPY, GBP/USD, GBP/JPY, AUD/JPY）
- 成行注文・指値注文
- ポジション管理
- 損益の自動計算

### チャート・分析機能
- ローソク足チャート
- 複数の時間足（1H, 4H, 1D）
- テクニカル指標（将来実装）
- 描画ツール（将来実装）

### 成績管理
- 取引履歴の詳細表示
- パフォーマンス統計（勝率、プロフィットファクター等）
- 資産推移の視覚化

## 🛠 技術スタック

- **フレームワーク**: React Native 0.72+
- **言語**: TypeScript 5.0+
- **状態管理**: Redux Toolkit
- **ナビゲーション**: React Navigation 6
- **データベース**: SQLite
- **データストレージ**: AsyncStorage

## 📦 インストール・セットアップ

### 必要な環境
- Node.js 18+
- React Native CLI
- iOS: Xcode 14+
- Android: Android Studio

### セットアップ手順

1. リポジトリのクローン
```bash
git clone https://github.com/[your-username]/fx-simulator.git
cd fx-simulator
```

2. 依存関係のインストール
```bash
npm install
```

3. iOS用の追加セットアップ（macOSのみ）
```bash
cd ios && pod install
```

4. アプリの実行

iOS:
```bash
npm run ios
```

Android:
```bash
npm run android
```

## 📁 プロジェクト構造

```
FXSimulator/
├── src/
│   ├── components/        # 再利用可能なコンポーネント
│   ├── screens/          # 画面コンポーネント
│   ├── navigation/       # ナビゲーション設定
│   ├── store/           # Redux状態管理
│   ├── services/        # データベース・API関連
│   ├── types/           # TypeScript型定義
│   └── assets/          # 画像・データファイル
├── android/             # Android固有の設定
├── ios/                 # iOS固有の設定
└── docs/                # ドキュメント
```

## 🗂 データベーススキーマ

### PriceData（価格データ）
- id, date, currency_pair, open, high, low, close

### Trade（取引データ）
- id, open_date, close_date, currency_pair, trade_type, amount, open_price, close_price, profit, status

### Account（口座データ）
- id, balance, initial_balance, created_at, updated_at

## 🔧 開発コマンド

- `npm run lint` - ESLint実行
- `npm run test` - テスト実行
- `npm run android` - Androidアプリ実行
- `npm run ios` - iOSアプリ実行
- `npm start` - Metro bundler起動

## 📋 開発ロードマップ

- [x] **Phase 1**: 基盤構築（プロジェクト設定、データベース、基本画面）
- [ ] **Phase 2**: コア機能実装（チャート表示、取引機能）
- [ ] **Phase 3**: 分析機能実装（テクニカル指標、描画ツール）
- [ ] **Phase 4**: 追加機能（目標設定、プッシュ通知、UI改善）
- [ ] **Phase 5**: リリース準備（テスト、ストア申請）

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は[LICENSE](LICENSE)ファイルをご覧ください。

## 🤝 コントリビューション

プルリクエストやイシューの報告を歓迎します。大きな変更を行う場合は、事前にイシューを作成して議論してください。

## ⚠️ 免責事項

このアプリは教育目的のみに使用してください。実際の投資判断は専門家にご相談ください。過去の成績は将来の結果を保証するものではありません。

---

**開発チーム**: FX Simulator Development Team
**バージョン**: 1.0.0
**最終更新**: 2024年9月