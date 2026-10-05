# ELUCENIA 内で臨床研究を検索

科学的な検索語を入力し、研究カテゴリーと検索範囲を選択してください。検索語は NCBI に送信されます。患者情報を入力しないでください。

## 方法と版

NLM Clinical Study Categories · December2011

## 入力

- **検索語** (`query`, `string`)
- **研究カテゴリー** (`category`, `enum`)
  - `therapy`: 治療
  - `diagnosis`: 診断
  - `etiology`: 病因
  - `prognosis`: 予後
  - `prediction`: 臨床予測ルール
- **検索範囲** (`scope`, `enum`)
  - `broad`: 広い範囲 · 感度重視
  - `narrow`: 狭い範囲 · 特異度重視
- **ページ** (`page`, `integer`) [0–999]

## 限界と検討

フィルターは個々の研究の質を評価しません。最大 10,000 件を表示します。それ以上の場合は検索を絞り込んでください。システマティックレビューの代わりにはなりません。

参考文献は NLM が提供するメタデータを保持します。

抄録や全文は転載しません。メタデータはリアルタイムで取得され、提供元で修正される場合があります。

出典：NLM / NCBI PubMed。NLM による推奨を意味しません。

技術的な確認には合成データを使用しています。独立した臨床レビューと専門家による翻訳レビューは実施されていません。

## 合成データで実行

```sh
node cli.cjs examples/input.json ja
```

## 結果

- 検索結果件数
- 適用した検索式
- PubMed による検索式の解釈
- 取得日時
- 参考文献は NLM が提供するメタデータを保持します。

## 出典と権利

- https://pubmed.ncbi.nlm.nih.gov/help/#clinical-study-categories
- https://www.ncbi.nlm.nih.gov/home/about/policies/

[RIGHTS-SCOPE.md](../RIGHTS-SCOPE.md) · [test receipts](../evidence/)

実際の検索を行う前に、NCBI_TOOL_EMAIL に運用責任者の連絡先を設定してください。未設定の場合、CLI は検索を拒否します。npm ci はロックファイルで指定された依存関係の版をインストールします。科学的な検索語を使用し、患者を識別する情報は送信しないでください。

```sh
npm ci
npm test
```
