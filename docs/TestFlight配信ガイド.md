# TestFlight 配信完全ガイド

## 🎯 Phase 1: Apple Developer Portal 設定 (15分)

### ステップ 1: App ID の作成

1. **Apple Developer ポータルにログイン**
   - https://developer.apple.com/account
   - Team を選択 (個人の場合は自動選択)

2. **Certificates, Identifiers & Profiles → Identifiers**
   - 左メニューから "Identifiers" をクリック
   - 右上の "+" ボタンをクリック

3. **App IDs を選択**
   ```
   □ App IDs を選択
   [Continue] ボタンをクリック
   ```

4. **App ID の詳細を入力**
   ```
   Description: FX Practice Simulator
   Bundle ID: Explicit
   Bundle ID: com.yourcompany.FXSimulator

   ※ yourcompany を実際の Company/Organization 名に変更
   例: com.makotobaba.FXSimulator
   ```

5. **Capabilities を設定** (必要に応じて)
   ```
   ☑ App Groups (複数デバイス間でデータ共有する場合)
   ☐ Push Notifications (現時点では不要)
   ☐ In-App Purchase (現時点では不要)
   ```

6. **[Continue] → [Register]** をクリック

---

### ステップ 2: Distribution Certificate の作成

1. **Certificates, Identifiers & Profiles → Certificates**
   - 左メニューから "Certificates" をクリック
   - 右上の "+" ボタンをクリック

2. **証明書タイプを選択**
   ```
   □ iOS Distribution (App Store and Ad Hoc)
   [Continue] ボタンをクリック
   ```

3. **CSR (Certificate Signing Request) の作成**

   **Mac の キーチェーンアクセス を起動**:
   ```
   アプリケーション → ユーティリティ → キーチェーンアクセス

   メニュー: キーチェーンアクセス → 証明書アシスタント
   → 認証局に証明書を要求...

   ユーザのメールアドレス: your-email@example.com
   通称: FX Simulator Distribution
   要求の処理: ディスクに保存
   鍵ペア情報を指定 にチェック

   [続ける] をクリック

   保存場所: デスクトップ
   ファイル名: CertificateSigningRequest.certSigningRequest

   [保存] をクリック

   鍵のサイズ: 2048 ビット
   アルゴリズム: RSA

   [続ける] → [完了]
   ```

4. **CSR ファイルをアップロード**
   - Apple Developer Portal に戻る
   - "Choose File" から保存した CSR ファイルを選択
   - [Continue] をクリック

5. **証明書をダウンロード**
   - [Download] ボタンをクリック
   - ダウンロードした `.cer` ファイルをダブルクリック
   - キーチェーンに自動的にインストールされます

---

### ステップ 3: Provisioning Profile の作成

1. **Certificates, Identifiers & Profiles → Profiles**
   - 左メニューから "Profiles" をクリック
   - 右上の "+" ボタンをクリック

2. **Distribution タイプを選択**
   ```
   □ App Store Connect
   [Continue] ボタンをクリック
   ```

3. **App ID を選択**
   ```
   App ID: com.yourcompany.FXSimulator (先ほど作成したもの)
   [Continue]
   ```

4. **Certificate を選択**
   ```
   ☑ 先ほど作成した Distribution Certificate を選択
   [Continue]
   ```

5. **Profile 名を入力**
   ```
   Provisioning Profile Name: FX Simulator Distribution
   [Generate]
   ```

6. **ダウンロードしてインストール**
   - [Download] ボタンをクリック
   - ダウンロードした `.mobileprovision` ファイルをダブルクリック
   - Xcode に自動的にインストールされます

---

## 🎯 Phase 2: App Store Connect 設定 (10分)

### ステップ 1: 新規アプリの作成

1. **App Store Connect にログイン**
   - https://appstoreconnect.apple.com
   - 同じ Apple ID でログイン

2. **マイ App → 新規 App**
   - 左上の "+" ボタン → "新規 App" をクリック

3. **アプリ情報を入力**
   ```
   プラットフォーム: iOS
   名前: FX Practice Simulator
   主言語: 日本語
   バンドル ID: com.yourcompany.FXSimulator (先ほど作成したもの)
   SKU: fxsimulator001 (任意のユニーク ID)
   ユーザアクセス: フルアクセス
   ```

4. **[作成] をクリック**

---

### ステップ 2: アプリ情報の入力

1. **App 情報タブ**
   ```
   サブタイトル: FX取引の練習アプリ
   カテゴリ:
     プライマリ: ファイナンス
     セカンダリ: 教育

   年齢制限: 4+
   ```

2. **価格および配信状況タブ**
   ```
   価格: 無料
   提供開始国または地域: すべての国/地域 (または日本のみ)
   ```

3. **App プライバシータブ**
   ```
   プライバシーポリシー URL: (必要に応じて)
   データ収集: なし (ローカルのみのアプリの場合)
   ```

---

## 🎯 Phase 3: Xcode プロジェクト設定 (5分)

### Xcode でプロジェクトを開く

```bash
cd /Users/makotobaba/Desktop/FXシミュレーター/ios
open FXSimulator.xcworkspace
```

### プロジェクト設定の確認

1. **プロジェクトナビゲータで "FXSimulator" を選択**

2. **TARGETS → FXSimulator → Signing & Capabilities**
   ```
   Team: あなたの Apple Developer Team を選択
   Bundle Identifier: com.yourcompany.FXSimulator

   ☑ Automatically manage signing のチェックを外す

   Provisioning Profile (Release):
     先ほど作成した "FX Simulator Distribution" を選択

   Signing Certificate (Release):
     "iOS Distribution" を選択
   ```

3. **General タブ**
   ```
   Display Name: FXシミュレーター
   Bundle Identifier: com.yourcompany.FXSimulator
   Version: 1.0.0
   Build: 1

   Deployment Info:
     iOS 12.4 以上
   ```

4. **Build Settings タブ**
   ```
   検索バーで "DEVELOPMENT_TEAM" を検索
   → あなたの Team ID を入力 (例: ABC123DEFG)
   ```

---

## 🎯 Phase 4: アプリのビルド & アップロード (20分)

### ステップ 1: Release ビルドの準備

1. **Xcode メニュー**
   ```
   Product → Scheme → Edit Scheme...

   Run → Build Configuration → Release に変更
   Archive → Build Configuration → Release を確認

   [Close]
   ```

2. **実機デバイスまたは "Any iOS Device" を選択**
   ```
   Xcode 上部のデバイス選択で:
   "Any iOS Device (arm64)" を選択
   ```

---

### ステップ 2: Archive の作成

1. **Product → Archive を選択**
   ```
   ビルドが開始されます (5-10分かかる場合があります)

   ビルド中のエラーが出た場合:
   - CocoaPods の問題: cd ios && pod install
   - 署名の問題: Signing & Capabilities を再確認
   ```

2. **Archive 成功後、Organizer が自動的に開きます**
   ```
   左側に作成した Archive が表示されます
   ```

---

### ステップ 3: App Store Connect へアップロード

1. **Organizer で最新の Archive を選択**

2. **[Distribute App] ボタンをクリック**

3. **配信方法を選択**
   ```
   ● App Store Connect
   [Next]
   ```

4. **配信オプションを選択**
   ```
   ● Upload
   [Next]
   ```

5. **App Store Connect の配信オプション**
   ```
   ☑ Upload your app's symbols to receive symbolicated reports
   ☑ Manage Version and Build Number (自動)

   [Next]
   ```

6. **証明書の自動管理**
   ```
   ● Automatically manage signing
   [Next]
   ```

7. **最終確認**
   ```
   Archive の内容を確認
   [Upload]
   ```

8. **アップロード完了を待つ (5-15分)**
   ```
   進行状況バーが表示されます
   完了すると "Upload Successful" と表示されます
   ```

---

## 🎯 Phase 5: TestFlight 設定 & テスター招待 (10分)

### ステップ 1: App Store Connect で TestFlight を設定

1. **App Store Connect → マイ App → FX Practice Simulator**

2. **TestFlight タブをクリック**

3. **ビルドの処理を待つ (15-30分)**
   ```
   Status: "処理中"

   処理が完了すると:
   Status: "テストの準備完了"
   ```

---

### ステップ 2: テスト情報の入力

1. **ビルドをクリック → テスト情報**
   ```
   テストの詳細:
   「このビルドには何が含まれていますか?」
   → 初回リリース。基本的なトレード機能を実装。

   フィードバックメール: your-email@example.com
   マーケティング URL: (オプション)
   プライバシーポリシー URL: (オプション)
   サインイン情報: (ログインが必要な場合)

   [保存]
   ```

2. **エクスポートコンプライアンス**
   ```
   「このアプリには暗号化が含まれていますか?」
   → いいえ (HTTPS のみの場合)

   [保存]
   ```

---

### ステップ 3: 内部テスター招待 (最大 100人)

1. **TestFlight → 内部テストタブ**

2. **テスターを追加**
   ```
   [+] ボタンをクリック

   メールアドレスを入力:
   - tester1@example.com
   - tester2@example.com

   [追加]
   ```

3. **ビルドを選択**
   ```
   最新のビルド (Build 1) を選択
   [テストを開始]
   ```

4. **招待メールが自動送信されます**

---

### ステップ 4: 外部テスター招待 (最大 10,000人)

1. **TestFlight → 外部テストタブ**

2. **新しいグループを作成**
   ```
   グループ名: ベータテスター
   [作成]
   ```

3. **ビルドを追加**
   ```
   最新のビルドを選択
   [次へ]
   ```

4. **Beta App Review に提出**
   ```
   テスト情報を入力:
   - アプリの説明
   - テスト方法
   - スクリーンショット (オプション)

   [提出]
   ```

5. **Apple のレビュー待ち (1-2日)**
   ```
   承認されたら外部テスターを招待できます
   ```

---

## 🎯 Phase 6: テスターの操作手順

### テスターがすること

1. **招待メールを開く**
   ```
   件名: "TestFlight で FX Practice Simulator をテストする"
   ```

2. **TestFlight アプリをインストール**
   ```
   App Store から "TestFlight" をダウンロード
   (Apple 公式アプリ)
   ```

3. **招待を承認**
   ```
   メール内の [View in TestFlight] をタップ

   TestFlight アプリが開く
   → [インストール] をタップ
   ```

4. **アプリのテスト**
   ```
   インストール完了後、アプリを起動
   フィードバックを TestFlight から送信可能
   ```

---

## 🔧 トラブルシューティング

### ビルドエラーが出る場合

**Signing エラー**:
```bash
# Provisioning Profile を再確認
Xcode → Preferences → Accounts → あなたの Apple ID
→ Manage Certificates... → + → iOS Distribution

# Derived Data をクリーン
rm -rf ~/Library/Developer/Xcode/DerivedData/*

# プロジェクトをクリーン
Product → Clean Build Folder (Shift + Cmd + K)
```

**CocoaPods エラー**:
```bash
cd ios
pod deintegrate
pod install
```

**Archive が作成できない**:
```bash
# スキームの確認
Product → Scheme → Manage Schemes...
→ FXSimulator が Shared になっているか確認
```

---

### アップロードエラーが出る場合

**"Invalid Bundle" エラー**:
- Info.plist の CFBundleVersion を確認
- 以前のビルドと重複していないか確認

**"Invalid Provisioning Profile" エラー**:
- Provisioning Profile を再ダウンロード
- Xcode の Preferences → Accounts → Download Manual Profiles

**"Missing Compliance" エラー**:
- App Store Connect → TestFlight → ビルド
- エクスポートコンプライアンスを設定

---

## 📊 新しいビルドをアップロードする場合

### バージョン番号のルール

```
Version: 1.0.0 (マーケティングバージョン)
Build: 1 → 2 → 3... (毎回インクリメント)

例:
- 初回: Version 1.0.0, Build 1
- 修正版: Version 1.0.0, Build 2
- 機能追加: Version 1.1.0, Build 3
- メジャー更新: Version 2.0.0, Build 4
```

### Info.plist の更新

```xml
<key>CFBundleShortVersionString</key>
<string>1.0.0</string>  <!-- Version -->
<key>CFBundleVersion</key>
<string>2</string>       <!-- Build: 1→2 に変更 -->
```

### 再アップロード手順

1. **ビルド番号をインクリメント**
2. **Product → Clean Build Folder**
3. **Product → Archive**
4. **Distribute App → App Store Connect**
5. **App Store Connect で新ビルドを確認**
6. **TestFlight で新ビルドを選択**

---

## ✅ チェックリスト

### Phase 1: 事前準備
- [ ] Apple Developer Program 登録完了 ($99/年)
- [ ] Xcode インストール済み
- [ ] Mac でキーチェーンアクセス利用可能

### Phase 2: Apple Developer Portal
- [ ] App ID 作成 (com.yourcompany.FXSimulator)
- [ ] Distribution Certificate 作成
- [ ] Provisioning Profile 作成・ダウンロード

### Phase 3: App Store Connect
- [ ] 新規アプリ作成
- [ ] アプリ情報入力 (名前、カテゴリ、価格)
- [ ] プライバシー設定

### Phase 4: Xcode 設定
- [ ] Bundle Identifier 設定
- [ ] Team 選択
- [ ] Provisioning Profile 設定 (Release)
- [ ] Version & Build 番号設定

### Phase 5: ビルド & アップロード
- [ ] Archive 作成成功
- [ ] App Store Connect へアップロード成功
- [ ] ビルドの処理完了 (15-30分)

### Phase 6: TestFlight 設定
- [ ] テスト情報入力
- [ ] エクスポートコンプライアンス設定
- [ ] 内部テスター招待
- [ ] 外部テスター設定 (オプション)

### Phase 7: テスト
- [ ] テスターが TestFlight 経由でインストール成功
- [ ] アプリが正常起動
- [ ] 主要機能が動作

---

## 📞 サポート情報

### 公式ドキュメント
- [TestFlight 公式ガイド](https://developer.apple.com/testflight/)
- [App Store Connect ヘルプ](https://help.apple.com/app-store-connect/)
- [React Native iOS デプロイ](https://reactnative.dev/docs/publishing-to-app-store)

### よくある質問

**Q: TestFlight のビルドは何日間有効?**
A: 90日間。期限切れ前に新しいビルドをアップロードする必要があります。

**Q: テスターは何人まで招待できる?**
A: 内部テスター 100人、外部テスター 10,000人

**Q: ビルドの審査はどれくらいかかる?**
A: 内部テスター: 即時、外部テスター: 1-2日

**Q: TestFlight から本番リリースへの移行は?**
A: 同じビルドを App Store Review に提出可能

---

**作成日**: 2025-10-03
**対象アプリ**: FX Practice Simulator v1.0.0
**React Native**: 0.72.0
