# 開発ガイド

## Git ワークフロー

このプロジェクトでは **Git Flow** に基づいたブランチ戦略を採用しています。

### ブランチ構造

```
main
├── develop
│   ├── feature/chart-implementation
│   ├── feature/trade-execution
│   └── feature/performance-analytics
└── hotfix/critical-bug-fix
```

### ブランチの説明

- **main**: 本番環境にデプロイされる安定版コード
- **develop**: 開発中の最新コード（次回リリース予定）
- **feature/***: 新機能開発用ブランチ
- **hotfix/***: 緊急バグ修正用ブランチ

### 開発フロー

#### 新機能開発の場合

1. developブランチから機能ブランチを作成
```bash
git checkout develop
git pull origin develop
git checkout -b feature/chart-display
```

2. 機能を実装・テスト
```bash
# 作業...
git add .
git commit -m "feat: implement basic chart display functionality"
```

3. developブランチにマージ
```bash
git checkout develop
git merge feature/chart-display
git push origin develop
git branch -d feature/chart-display
```

#### リリース準備

1. developからmainにマージ
```bash
git checkout main
git merge develop
git tag v1.0.0
git push origin main --tags
```

#### ホットフィックス

1. mainからホットフィックスブランチを作成
```bash
git checkout main
git checkout -b hotfix/critical-database-fix
```

2. 修正後、mainとdevelopの両方にマージ
```bash
git checkout main
git merge hotfix/critical-database-fix
git checkout develop
git merge hotfix/critical-database-fix
git branch -d hotfix/critical-database-fix
```

## コミットメッセージ規約

### フォーマット
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント更新
- `style`: コードスタイル修正
- `refactor`: リファクタリング
- `perf`: パフォーマンス改善
- `test`: テスト追加・修正
- `chore`: その他の変更

### 例
```
feat(chart): add candlestick chart display

- Implement basic candlestick rendering
- Add support for multiple timeframes
- Include zoom and pan functionality

Closes #123
```

## プルリクエストガイドライン

### PR作成時のチェックリスト

- [ ] ESLintエラーがない
- [ ] TypeScriptコンパイルエラーがない
- [ ] 適切なテストが追加されている
- [ ] READMEが必要に応じて更新されている
- [ ] 変更内容が明確に説明されている

### PRテンプレート

```markdown
## 概要
この変更の概要を説明してください。

## 変更内容
- 変更点1
- 変更点2
- 変更点3

## テスト
- [ ] 単体テスト追加
- [ ] 統合テスト追加
- [ ] 手動テスト完了

## スクリーンショット（UI変更の場合）
変更前後のスクリーンショットを添付

## 関連Issue
Closes #123
```

## 開発環境セットアップ

### 必要ツール
- Node.js 18+
- React Native CLI
- Xcode (iOS開発の場合)
- Android Studio (Android開発の場合)
- Git

### 初回セットアップ
```bash
# リポジトリクローン
git clone https://github.com/YOUR_USERNAME/fx-simulator.git
cd fx-simulator

# 依存関係インストール
npm install

# iOS (macOSのみ)
cd ios && pod install && cd ..

# 開発サーバー起動
npm start
```

### 日常的な開発コマンド
```bash
# Linting
npm run lint

# Type checking
npx tsc --noEmit

# iOS実行
npm run ios

# Android実行
npm run android

# テスト実行
npm test
```

## コードレビューガイドライン

### レビュアー向け

- [ ] コードが要件を満たしているか
- [ ] TypeScript型定義が適切か
- [ ] パフォーマンスに問題がないか
- [ ] セキュリティ上の問題がないか
- [ ] コードが読みやすく保守しやすいか

### 作成者向け

- [ ] 自己レビューを実施済み
- [ ] テストが通ることを確認
- [ ] ドキュメントが更新されている
- [ ] レビューのフィードバックに適切に対応

## リリースプロセス

### バージョニング
Semantic Versioning (SemVer) を使用：
- **MAJOR**: 破壊的変更
- **MINOR**: 機能追加
- **PATCH**: バグ修正

### リリース手順
1. developブランチで機能開発完了
2. リリースブランチ作成（必要に応じて）
3. テスト・バグ修正
4. mainブランチにマージ
5. タグ作成・プッシュ
6. アプリストアにリリース

## トラブルシューティング

### よくある問題

#### Metro bundlerエラー
```bash
npx react-native start --reset-cache
```

#### iOS Podエラー
```bash
cd ios
pod deintegrate
pod install
```

#### Android build エラー
```bash
cd android
./gradlew clean
```

### 問題報告

バグや問題を発見した場合は、以下の情報を含めてIssueを作成してください：

- 問題の詳細な説明
- 再現手順
- 期待される動作
- 実際の動作
- 環境情報（OS、Node.jsバージョン等）
- エラーメッセージ（ある場合）