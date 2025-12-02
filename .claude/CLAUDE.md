# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

このリポジトリは、開発者にClaude Codeの効果的な使い方を教えるための、Claude Codeハンズオン講習用リポジトリです。以下の内容が含まれます：

- **example1/**: ハンズオン演習で使用するNext.js 16プロジェクト
- **issues/**: Claude Codeの機能を段階的に学ぶためのタスクファイル（task1.md〜task7.md）

## トレーニング構成

トレーニングは7つのタスクで段階的に進みます：

1. **task1.md**: Claude Codeのインストール
2. **task2.md**: プロジェクトの初期化
3. **task3.md**: WebSearch設定
4. **task4.md**: WebSearchでNext.jsを理解する
5. **task5.md**: カスタムコマンドの作成
6. **task6.md**: サブエージェントの作成
7. **task7.md**: 新機能の実装（総合演習）

## example1プロジェクト（Next.js 16）

### 技術スタック

- **フレームワーク**: Next.js 16.0.1（App Router使用）
- **React**: 19.2.0
- **TypeScript**: ^5（strict mode有効）
- **スタイリング**: CSS Modules（globals.css、page.module.css）
- **リンティング**: ESLint 9（eslint-config-next使用）

### プロジェクト構造

```
example1/
├── src/
│   └── app/              # App Routerディレクトリ
│       ├── page.tsx      # ホームページ（Server Component）
│       ├── layout.tsx    # ルートレイアウト
│       ├── globals.css   # グローバルスタイル
│       └── page.module.css # ページ固有のCSS Module
├── public/               # 静的アセット（SVGファイル）
├── package.json
├── tsconfig.json
├── next.config.ts
└── eslint.config.mjs
```

### example1の主要コマンド

**開発:**
```bash
cd example1
npm install          # 依存関係のインストール（初回のみ）
npm run dev         # 開発サーバーを起動（http://localhost:3000）
```

**ビルドと本番環境:**
```bash
npm run build       # 本番ビルドを作成
npm run start       # 本番サーバーを起動
```

**リンティング:**
```bash
npm run lint        # ESLintを実行
```

### TypeScript設定

- パスエイリアス設定: `@/*` は `./src/*` にマッピング
- Strict mode有効
- ターゲット: ES2017
- JSX: react-jsx（React 19の自動ランタイム）
- モジュール解決: bundler（Next.js 16のデフォルト）

### example1での開発における重要な注意事項

**Next.js 16 App Router:**
- `src/app/`内のすべてのコンポーネントはデフォルトでServer Component
- Client Component（インタラクティブ機能、フック、ブラウザAPI）には`'use client'`ディレクティブを使用
- フォーム処理とミューテーションにはServer Actionsが利用可能
- APIエンドポイント用のRoute Handlerは`route.ts`ファイルとして作成可能

**コンポーネントパターン:**
- Server Components: データ取得、useState/useEffectは使用不可
- Client Components: ユーザーインタラクション、状態管理、ブラウザAPI
- CSS Modules: スコープ付きスタイルには`.module.css`サフィックスを使用

**環境変数:**
- APIキーやシークレット情報には`.env.local`を使用（Gitにコミットしない）
- 公開変数には`NEXT_PUBLIC_`プレフィックスを付ける
- サーバー専用変数にはプレフィックス不要

**新機能を追加する際:**
- `src/app/`に新しいルートフォルダを作成
- 適切な型付けでTypeScriptを使用
- Next.js 16 App Routerの規約に従う
- Server ComponentとClient Componentの使い分けを考慮

## トレーニングの教育方針

このトレーニングでは以下を重視しています：

1. **段階的学習**: タスクが互いに積み重なっていく構成
2. **ハンズオン実践**: 実際のNext.jsプロジェクトで作業
3. **ペアプログラミング**: Claude Codeとの対話を推奨
4. **インクリメンタル開発**: 「小さく作り、頻繁にテスト」のアプローチ
5. **実践的スキル**: API統合、デバッグ、ドキュメント作成

### Task 7（最終演習）のアプローチ

Task 7は、学習者がゼロから機能を実装する総合演習として設計されています。Task 7のサポート時は：

- **段階的実装**を推奨: 最小動作版 → API統合 → 仕上げ
- **対話を促進**: 明確化の質問をし、代替案を提案
- **インクリメンタルテストを強調**: 次に進む前に各段階をテスト
- **ベストプラクティスを推奨**: Next.js 16パターン、TypeScript型付け、エラーハンドリング
- **学習をサポート**: 「どうやって」だけでなく「なぜ」を説明

## このリポジトリでの作業方法

**トレーニング講師向け:**
- タスクは順番に完了するよう設計されています
- 各タスクには所要時間の目安と確認チェックリストが含まれています
- Task 7では様々な難易度の機能アイデアを提供しています

**Claude Codeインスタンス向け:**
- タスクについて質問された際は、`issues/`内の該当タスクファイルを参照してください
- example1での作業時は、常にNext.js 16の最新ベストプラクティスを確認してください
- 学習者に質問を促し、「なぜ」を理解してもらうようにしてください
- 複雑な変更は小さく、テスト可能なステップに分割することを提案してください

**主要なトレーニングファイル:**
- メイントレーニングガイド: `README.md`（日本語）
- 個別タスク手順: `issues/task*.md`
- 実習プロジェクト: `example1/`
