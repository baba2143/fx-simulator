#!/bin/bash

# TestFlight 用 iOS ビルドスクリプト
# 使用方法: ./scripts/build-testflight.sh

set -e  # エラーで停止

echo "🚀 FX Simulator - TestFlight ビルドスクリプト"
echo "=============================================="

# カラー定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# プロジェクトルート
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo ""
echo "${BLUE}📍 プロジェクトルート: $PROJECT_ROOT${NC}"
echo ""

# Step 1: 依存関係の確認
echo "${YELLOW}Step 1: 依存関係の確認${NC}"
echo "-----------------------------------"

if ! command -v xcodebuild &> /dev/null; then
    echo "${RED}❌ Xcode がインストールされていません${NC}"
    echo "   Xcode を App Store からインストールしてください"
    exit 1
fi

XCODE_VERSION=$(xcodebuild -version | head -1)
echo "${GREEN}✅ $XCODE_VERSION${NC}"

if ! command -v pod &> /dev/null; then
    echo "${RED}❌ CocoaPods がインストールされていません${NC}"
    echo "   インストール: sudo gem install cocoapods"
    exit 1
fi

POD_VERSION=$(pod --version)
echo "${GREEN}✅ CocoaPods $POD_VERSION${NC}"

echo ""

# Step 2: npm パッケージの確認
echo "${YELLOW}Step 2: npm パッケージの確認${NC}"
echo "-----------------------------------"

if [ ! -d "node_modules" ]; then
    echo "📦 node_modules が見つかりません。インストール中..."
    npm install
else
    echo "${GREEN}✅ node_modules 存在確認${NC}"
fi

echo ""

# Step 3: iOS 依存関係のインストール
echo "${YELLOW}Step 3: iOS 依存関係 (CocoaPods)${NC}"
echo "-----------------------------------"

cd ios

if [ ! -d "Pods" ]; then
    echo "📦 Pods が見つかりません。インストール中..."
    pod install
else
    echo "🔄 Pods を更新中..."
    pod install --repo-update
fi

echo "${GREEN}✅ CocoaPods インストール完了${NC}"
echo ""

cd ..

# Step 4: ビルド番号の自動インクリメント (オプション)
echo "${YELLOW}Step 4: バージョン情報の確認${NC}"
echo "-----------------------------------"

INFO_PLIST="ios/FXSimulator/Info.plist"

if [ -f "$INFO_PLIST" ]; then
    VERSION=$(/usr/libexec/PlistBuddy -c "Print CFBundleShortVersionString" "$INFO_PLIST")
    BUILD=$(/usr/libexec/PlistBuddy -c "Print CFBundleVersion" "$INFO_PLIST")

    echo "📱 現在のバージョン: $VERSION"
    echo "🔢 現在のビルド番号: $BUILD"

    # ビルド番号を自動インクリメント
    NEW_BUILD=$((BUILD + 1))

    read -p "ビルド番号を $BUILD → $NEW_BUILD にインクリメントしますか? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        /usr/libexec/PlistBuddy -c "Set :CFBundleVersion $NEW_BUILD" "$INFO_PLIST"
        echo "${GREEN}✅ ビルド番号を $NEW_BUILD に更新しました${NC}"
        BUILD=$NEW_BUILD
    fi
else
    echo "${RED}❌ Info.plist が見つかりません${NC}"
    exit 1
fi

echo ""

# Step 5: クリーンビルド
echo "${YELLOW}Step 5: クリーンビルド${NC}"
echo "-----------------------------------"

echo "🧹 Derived Data をクリーン中..."
rm -rf ~/Library/Developer/Xcode/DerivedData/FXSimulator-*

echo "🧹 ビルドフォルダをクリーン中..."
rm -rf ios/build

echo "${GREEN}✅ クリーン完了${NC}"
echo ""

# Step 6: Archive の作成
echo "${YELLOW}Step 6: Archive の作成${NC}"
echo "-----------------------------------"
echo "⏳ これには 5-10分かかる場合があります..."
echo ""

SCHEME="FXSimulator"
WORKSPACE="ios/FXSimulator.xcworkspace"
ARCHIVE_PATH="ios/build/FXSimulator.xcarchive"
EXPORT_PATH="ios/build/ipa"

# Archive を作成
xcodebuild archive \
    -workspace "$WORKSPACE" \
    -scheme "$SCHEME" \
    -configuration Release \
    -archivePath "$ARCHIVE_PATH" \
    -destination "generic/platform=iOS" \
    -allowProvisioningUpdates \
    CODE_SIGN_STYLE=Automatic \
    | tee ios/build/archive.log \
    | xcpretty || true

# Archive が成功したか確認
if [ ! -d "$ARCHIVE_PATH" ]; then
    echo ""
    echo "${RED}❌ Archive の作成に失敗しました${NC}"
    echo ""
    echo "ログを確認してください: ios/build/archive.log"
    echo ""
    echo "よくあるエラー:"
    echo "  1. 署名の問題 → Xcode で Signing & Capabilities を確認"
    echo "  2. CocoaPods の問題 → cd ios && pod install"
    echo "  3. Team の問題 → Xcode で Team を選択"
    exit 1
fi

echo ""
echo "${GREEN}✅ Archive の作成に成功しました${NC}"
echo "   場所: $ARCHIVE_PATH"
echo ""

# Step 7: ExportOptions.plist の確認
echo "${YELLOW}Step 7: Export Options の確認${NC}"
echo "-----------------------------------"

EXPORT_OPTIONS="ios/ExportOptions.plist"

if [ ! -f "$EXPORT_OPTIONS" ]; then
    echo "📝 ExportOptions.plist を作成中..."
    cat > "$EXPORT_OPTIONS" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>uploadSymbols</key>
    <true/>
    <key>uploadBitcode</key>
    <false/>
    <key>compileBitcode</key>
    <false/>
    <key>signingStyle</key>
    <string>automatic</string>
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
</dict>
</plist>
EOF
    echo "${YELLOW}⚠️  ExportOptions.plist を手動で編集してください${NC}"
    echo "   YOUR_TEAM_ID を実際の Team ID に変更してください"
    echo ""
fi

echo "${GREEN}✅ ExportOptions.plist 確認完了${NC}"
echo ""

# Step 8: IPA の Export
echo "${YELLOW}Step 8: IPA の Export${NC}"
echo "-----------------------------------"
echo "⏳ IPA をエクスポート中..."
echo ""

xcodebuild -exportArchive \
    -archivePath "$ARCHIVE_PATH" \
    -exportPath "$EXPORT_PATH" \
    -exportOptionsPlist "$EXPORT_OPTIONS" \
    -allowProvisioningUpdates \
    | tee ios/build/export.log \
    | xcpretty || true

# Export が成功したか確認
IPA_FILE="$EXPORT_PATH/$SCHEME.ipa"

if [ ! -f "$IPA_FILE" ]; then
    echo ""
    echo "${RED}❌ IPA のエクスポートに失敗しました${NC}"
    echo ""
    echo "ログを確認してください: ios/build/export.log"
    exit 1
fi

echo ""
echo "${GREEN}✅ IPA のエクスポートに成功しました${NC}"
echo "   場所: $IPA_FILE"
echo ""

# IPA のサイズを表示
IPA_SIZE=$(du -h "$IPA_FILE" | cut -f1)
echo "📦 IPA サイズ: $IPA_SIZE"
echo ""

# Step 9: アップロード (オプション)
echo "${YELLOW}Step 9: App Store Connect へのアップロード${NC}"
echo "-----------------------------------"
echo ""
echo "次のいずれかの方法でアップロードできます:"
echo ""
echo "【方法 1】Xcode Organizer を使用 (推奨):"
echo "  1. Xcode を開く"
echo "  2. Window → Organizer"
echo "  3. Archives タブを選択"
echo "  4. 最新の Archive を選択"
echo "  5. [Distribute App] をクリック"
echo "  6. App Store Connect を選択"
echo ""
echo "【方法 2】Application Loader を使用:"
echo "  1. Xcode → Open Developer Tool → Application Loader"
echo "  2. [Deliver Your App] をクリック"
echo "  3. IPA ファイルを選択: $IPA_FILE"
echo ""
echo "【方法 3】xcrun altool を使用 (コマンドライン):"
echo ""
echo "  xcrun altool --upload-app \\"
echo "    --type ios \\"
echo "    --file \"$IPA_FILE\" \\"
echo "    --username \"YOUR_APPLE_ID\" \\"
echo "    --password \"@keychain:APP_SPECIFIC_PASSWORD\""
echo ""
echo "  ※ APP_SPECIFIC_PASSWORD は App 用パスワードを取得:"
echo "     https://appleid.apple.com → セキュリティ → App 用パスワード"
echo ""

read -p "今すぐコマンドラインでアップロードしますか? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Apple ID (メールアドレス): " APPLE_ID

    echo ""
    echo "⏳ アップロード中... (5-15分かかる場合があります)"
    echo ""

    xcrun altool --upload-app \
        --type ios \
        --file "$IPA_FILE" \
        --username "$APPLE_ID" \
        --password "@keychain:AC_PASSWORD" \
        || echo "${YELLOW}⚠️  アップロードに失敗しました。Xcode Organizer を使用してください${NC}"
fi

echo ""
echo "${GREEN}🎉 ビルドプロセス完了！${NC}"
echo ""
echo "=============================================="
echo "📱 ビルド情報"
echo "=============================================="
echo "バージョン: $VERSION"
echo "ビルド: $BUILD"
echo "Archive: $ARCHIVE_PATH"
echo "IPA: $IPA_FILE"
echo "サイズ: $IPA_SIZE"
echo ""
echo "=============================================="
echo "次のステップ"
echo "=============================================="
echo "1. App Store Connect にアクセス"
echo "   https://appstoreconnect.apple.com"
echo ""
echo "2. マイ App → FX Practice Simulator"
echo ""
echo "3. TestFlight タブ"
echo ""
echo "4. ビルドの処理完了を待つ (15-30分)"
echo ""
echo "5. テスト情報を入力"
echo ""
echo "6. テスターを招待"
echo ""
echo "=============================================="
echo ""
