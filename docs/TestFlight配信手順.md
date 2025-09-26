# 📱 TestFlight配信手順

## 前提条件
- Apple Developer Program登録済み（年間$99）
- Xcode最新版インストール済み
- App Store Connect アカウント設定済み

## Step 1: プロジェクトの設定

### 1.1 Bundle IDの設定
```bash
# Xcodeでプロジェクトを開く
open ios/FXSimulator.xcworkspace
```

Xcodeで:
1. プロジェクトナビゲーターで「FXSimulator」を選択
2. 「Signing & Capabilities」タブを開く
3. Bundle Identifier: `com.yourcompany.fxsimulator`
4. Team: あなたのDeveloper Team を選択
5. Automatically manage signing にチェック

### 1.2 アプリ情報の設定

`ios/FXSimulator/Info.plist` を編集:
```xml
<key>CFBundleDisplayName</key>
<string>FXシミュレーター</string>
<key>CFBundleShortVersionString</key>
<string>1.0.0</string>
<key>CFBundleVersion</key>
<string>1</string>
```

## Step 2: アプリアイコンとスクリーンショット

### 2.1 アイコンの準備
```bash
# 必要なサイズ
- 1024x1024 (App Store用)
- 180x180 (iPhone @3x)
- 120x120 (iPhone @2x)
- 152x152 (iPad @2x)
- 167x167 (iPad Pro)
```

### 2.2 起動画面の設定
`ios/FXSimulator/LaunchScreen.storyboard` で設定

## Step 3: アーカイブとアップロード

### 3.1 Releaseビルドの作成

#### 方法1: Xcodeから
1. Xcodeで Product > Scheme > Edit Scheme
2. Run > Info > Build Configuration を「Release」に変更
3. Product > Archive
4. アーカイブ完了後、Organizer が開く

#### 方法2: コマンドラインから
```bash
# クリーンビルド
cd ios
xcodebuild clean -workspace FXSimulator.xcworkspace -scheme FXSimulator

# アーカイブ作成
xcodebuild archive \
  -workspace FXSimulator.xcworkspace \
  -scheme FXSimulator \
  -configuration Release \
  -archivePath ~/Desktop/FXSimulator.xcarchive

# IPAファイル作成
xcodebuild -exportArchive \
  -archivePath ~/Desktop/FXSimulator.xcarchive \
  -exportPath ~/Desktop \
  -exportOptionsPlist ExportOptions.plist
```

### 3.2 App Store Connectへアップロード

#### Xcodeから:
1. Organizer で作成したアーカイブを選択
2. 「Distribute App」をクリック
3. 「App Store Connect」を選択
4. 「Upload」を選択
5. アップロード完了を待つ

## Step 4: TestFlight設定

### 4.1 App Store Connectにログイン
https://appstoreconnect.apple.com

### 4.2 TestFlight設定
1. 「マイApp」から「FXシミュレーター」を選択
2. 「TestFlight」タブを選択
3. ビルドが処理中から利用可能になるまで待つ（通常30分程度）

### 4.3 テスター追加

#### 内部テスター（最大100人）:
1. 「内部グループ」を作成
2. テスターのメールアドレスを追加
3. ビルドを選択して配信

#### 外部テスター（最大10,000人）:
1. 「外部グループ」を作成
2. テスト情報を入力（ベータ版の説明など）
3. Appleのレビューを待つ（通常24-48時間）
4. 承認後、テスターを招待

### 4.4 テスターへの招待
テスターに送られるメール:
1. TestFlightアプリをApp Storeからダウンロード
2. 招待メールのリンクをタップ
3. TestFlightでアプリをインストール

## Step 5: フィードバック収集

### TestFlightのフィードバック機能:
- クラッシュレポート自動収集
- スクリーンショット付きフィードバック
- ビルド有効期限: 90日間

## トラブルシューティング

### よくある問題と解決方法

#### 1. ビルドエラー「No team selected」
- Xcodeで Team を選択
- Apple Developer Program に登録確認

#### 2. 「Missing compliance」エラー
- App Store Connect で輸出規制の質問に回答
- 暗号化を使用しない場合は「No」を選択

#### 3. アップロードエラー
```bash
# Xcodeのキャッシュクリア
rm -rf ~/Library/Developer/Xcode/DerivedData/

# 再度アーカイブ作成
```

#### 4. TestFlightでインストールできない
- デバイスのiOSバージョン確認
- Deployment Target の確認（iOS 13.0以上推奨）

## 必要なファイル作成

### ExportOptions.plist
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
    <key>uploadBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <true/>
</dict>
</plist>
```

## チェックリスト

- [ ] Apple Developer Program 登録
- [ ] Bundle ID 設定
- [ ] Signing 設定
- [ ] アプリアイコン（全サイズ）
- [ ] LaunchScreen 設定
- [ ] Info.plist 更新
- [ ] Releaseビルド作成
- [ ] App Store Connect にアプリ作成
- [ ] TestFlightビルドアップロード
- [ ] テスターグループ作成
- [ ] テスター招待送信
- [ ] フィードバック収集開始

## 次のステップ

TestFlightでのテスト完了後:
1. フィードバックに基づく修正
2. バージョン番号更新
3. 新しいビルドをアップロード
4. 本番リリース準備（App Store審査）