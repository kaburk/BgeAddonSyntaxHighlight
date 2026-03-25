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


## ライセンス

MIT License

Copyright (c) 2026 kaburk

本ソフトウェアは MIT ライセンスのもとで公開されています。詳細は [LICENCE.txt](LICENCE.txt) を参照してください。

### 使用ライブラリ

| ライブラリ | ライセンス | リンク |
|---|---|---|
| highlight.js | BSD 3-Clause | https://github.com/highlightjs/highlight.js |
| highlightjs-line-numbers.js | MIT | https://github.com/wcoder/highlightjs-line-numbers.js |

