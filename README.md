# BgeAddonSyntaxHighlight

BurgerEditor用カスタムブロックのシンタックスハイライト表示ブロックです。
[highlight.js](https://highlightjs.org/) を使用してブログ記事や固定ページなどでプログラムのソースコードを色分け表示します。

## 必要要件

- baserCMS 5.x
- BurgerEditor プラグイン

## 機能

- コードブロックのシンタックスハイライト
- 管理画面でのリアルタイムプレビュー
- 言語の自動検出（手動指定も可）
- 行番号の表示切り替え
- コードコピーボタン（ホバー時表示）

## インストール

1. [このリポジトリのreleases](https://github.com/kaburk/BgeAddonSyntaxHighlight/releases) から ZIP ファイルをダウンロードします
2. baserCMS 管理画面の **「プラグイン管理」→「新規追加」** を開きます
3. ダウンロードした ZIP ファイルをアップロードします
4. プラグイン一覧に `BgeAddonSyntaxHighlight` が表示されたら **「有効」** に切り替えます

## 対応言語

自動検出のほか、以下の言語を手動選択できます：

HTML, CSS, JavaScript, TypeScript, PHP, Python, Ruby, Bash/Shell, SQL, JSON, YAML, Markdown

## ファイル構成

```
BgeAddonSyntaxHighlight/
├── BurgerAddon/
│   ├── block/
│   │   └── syntax-highlight/
│   │       ├── index.php       ← ブロック定義（syntax-highlight タイプを呼び出す）
│   │       ├── panel.svg       ← ブロック選択パネルのアイコン
│   │       └── style.scss      ← ブロックレベルのスタイル
│   └── type/
│       └── syntax-highlight/
│           ├── init.js         ← BurgerEditor タイプモジュール（ハイライト・行番号・コピー処理）
│           ├── init.php        ← init.js の読み込み
│           ├── input.php       ← 編集ダイアログ（言語選択・チェックボックス・コード入力・プレビュー）
│           ├── load.php        ← 管理画面向けアセット読み込み・iframe CSS 注入
│           ├── style.scss      ← タイプレベルのスタイル（未使用・CSS は webroot 側に集約）
│           ├── value.php       ← フロントエンド出力テンプレート
│           └── version.php     ← バージョン定義 "1.0.0"
├── config/
│   └── setting.php             ← プラグイン設定
├── src/
│   ├── BgeAddonSyntaxHighlightPlugin.php
│   └── Event/
│       └── BgeAddonSyntaxHighlightViewEventListener.php  ← フロントエンドへのアセット自動注入
└── webroot/
    ├── css/
    │   ├── bge-addon-syntax-highlight.css  ← メインスタイル（行番号テーブル・コピーボタン等）
    │   └── vendor/
    │       └── highlight-theme.min.css     ← テーマ
    └── js/
        └── vendor/
            ├── highlight.min.js                 ← highlight.js 本体
            └── highlightjs-line-numbers.min.js  ← 行番号プラグイン
```

## ライセンス

MIT License

Copyright (c) 2026 kaburk

本ソフトウェアは MIT ライセンスのもとで公開されています。詳細は [LICENCE.txt](LICENCE.txt) を参照してください。

### 使用ライブラリ

| ライブラリ | ライセンス | リンク |
|---|---|---|
| highlight.js | BSD 3-Clause | https://github.com/highlightjs/highlight.js |
| highlightjs-line-numbers.js | MIT | https://github.com/wcoder/highlightjs-line-numbers.js |

