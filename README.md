# Color Picker - Chrome拡張機能

画面からカラーコードを抽出するChrome拡張機能です。

## 機能

- **画面から色を抽出**: EyeDropper APIを使用して、画面上の任意のピクセルから色を抽出
- **ページの色を分析**: 現在のWebページで使用されているすべての色を分析・表示
- **複数のカラーフォーマット対応**: HEX、RGB、HSLの各形式で色を表示
- **ワンクリックコピー**: 抽出した色を簡単にクリップボードにコピー

## インストール方法

### 1. アイコンの準備

Chrome拡張機能にはPNG形式のアイコンが必要です。以下のいずれかの方法でアイコンを用意してください：

#### オプションA: オンラインツールでSVGをPNGに変換
1. `icons/icon.svg` を開く
2. https://convertio.co/ja/svg-png/ などのツールでPNGに変換
3. 3つのサイズ（16x16、48x48、128x128）を作成
4. `icons/icon16.png`、`icons/icon48.png`、`icons/icon128.png` として保存

#### オプションB: 簡易アイコンを自分で作成
以下のコマンドでシンプルなアイコンを作成できます（ImageMagickが必要）：

```bash
# ImageMagickを使用してアイコンを生成
convert -size 16x16 xc:"#667eea" icons/icon16.png
convert -size 48x48 xc:"#667eea" icons/icon48.png
convert -size 128x128 xc:"#667eea" icons/icon128.png
```

または、任意の画像編集ソフトで各サイズのPNG画像を作成してください。

### 2. Chromeに拡張機能をインストール

1. Chromeを開き、アドレスバーに `chrome://extensions/` と入力
2. 右上の「デベロッパーモード」をオンにする
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. このプロジェクトのフォルダ（`c:\Dev\ColorPicker`）を選択

## 使い方

### 画面から色を抽出

1. Chrome拡張機能のアイコンをクリックしてポップアップを開く
2. 「画面から色を抽出」ボタンをクリック
3. マウスカーソルがカラーピッカーに変わるので、色を抽出したい場所をクリック
4. 抽出された色がHEX、RGB、HSL形式で表示される
5. 「コピー」ボタンで各フォーマットの色をクリップボードにコピー

### ページの色を分析

1. Chrome拡張機能のアイコンをクリックしてポップアップを開く
2. 「ページの色を分析」ボタンをクリック
3. 現在のページで使用されている色が一覧表示される
4. 色をクリックすると詳細が表示され、自動的にクリップボードにコピーされる

## 技術仕様

- **Manifest Version**: 3
- **必要な権限**:
  - `activeTab`: 現在のタブにアクセス
  - `scripting`: ページに色抽出スクリプトを注入

## ファイル構成

```
ColorPicker/
├── manifest.json       # 拡張機能の設定
├── popup.html          # ポップアップのHTML
├── popup.css           # ポップアップのスタイル
├── popup.js            # ポップアップのロジック
├── content.js          # コンテンツスクリプト
├── icons/              # アイコンフォルダ
│   ├── icon.svg        # SVGアイコン（変換用）
│   ├── icon16.png      # 16x16アイコン（要作成）
│   ├── icon48.png      # 48x48アイコン（要作成）
│   └── icon128.png     # 128x128アイコン（要作成）
└── README.md           # このファイル
```

## 対応ブラウザ

- Google Chrome (EyeDropper API対応版)
- Microsoft Edge
- その他のChromiumベースのブラウザ

注意: EyeDropper APIはChrome 95以降で利用可能です。

## トラブルシューティング

### 「EyeDropper APIに対応していません」と表示される

- Chromeのバージョンが95以降であることを確認してください
- `chrome://flags/#eye-dropper` でEyeDropper APIが有効になっていることを確認してください

### アイコンが表示されない

- `icons/` フォルダに `icon16.png`、`icon48.png`、`icon128.png` が存在することを確認してください
- 拡張機能を再読み込みしてください

### 色が抽出できない

- ページが完全に読み込まれていることを確認してください
- 一部のページ（chrome://など）では拡張機能が動作しません

## ライセンス

MIT License