# GitHub接続セットアップガイド

## 現在の状況
✅ ローカルGitリポジトリ: 設定済み
✅ リモートリポジトリ追加: 完了
❌ 認証設定: **要設定**

## 認証設定手順

### Personal Access Token方式（推奨）

#### 1. GitHubでPersonal Access Tokenを作成
1. GitHub.com にログイン
2. 右上のプロフィール画像 → **Settings**
3. 左サイドバー → **Developer settings**
4. **Personal access tokens** → **Tokens (classic)**
5. **Generate new token (classic)** をクリック
6. 設定項目：
   - **Note**: `FX Simulator Development`
   - **Expiration**: `90 days` または `No expiration`
   - **Scopes**: ✅ **repo** (Full control of private repositories)
7. **Generate token** をクリック
8. 🚨 **重要**: トークンをコピーして安全な場所に保存（再表示されません）

#### 2. Git設定
ターミナルで以下を実行：

```bash
# ユーザー情報設定（GitHubのユーザー名とメールアドレスに変更）
git config --global user.name "baba2143"
git config --global user.email "your-email@example.com"

# 設定確認
git config --global --list
```

#### 3. リポジトリにプッシュ
```bash
cd "/Users/makotobaba/Desktop/FXシミュレーター"

# mainブランチをプッシュ
git push -u origin main
```

プッシュ時に認証を求められたら：
- **Username**: `baba2143`
- **Password**: **生成したPersonal Access Token** (GitHubパスワードではありません)

#### 4. 成功確認
プッシュが成功したら：
```bash
# developブランチを作成してプッシュ
git checkout -b develop
git push -u origin develop

# mainブランチに戻る
git checkout main
```

## トラブルシューティング

### エラー: "Authentication failed"
- Personal Access Tokenが正しいか確認
- トークンの有効期限が切れていないか確認
- Scopeで "repo" が選択されているか確認

### エラー: "Permission denied"
- GitHubリポジトリへのアクセス権限があるか確認
- リポジトリのURLが正しいか確認

### パスワード認証が求められる場合
- GitHubはパスワード認証を廃止しています
- Personal Access TokenまたはSSH認証が必要

## 設定完了後の確認

設定が完了したら、以下のコマンドで確認：

```bash
# リモートブランチの確認
git branch -r

# GitHub上のリポジトリと同期状況確認
git status
```

## 次のステップ

認証設定が完了したら：
1. ✅ mainブランチがGitHubにプッシュされている
2. ✅ developブランチを作成・プッシュ
3. ✅ GitHub上でリポジトリが正しく表示される

これで開発準備完了です！