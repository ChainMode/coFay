# 06. coFACTS適合性フレームワークとロードマップ

## 6.1 なぜ `iFACTS` と `coFACTS` の直交する境界を明確に画定しなければならないのか

オープンなプロトコル・エコシステムにおいて、「ある実装が仕様を真に遵守していることを、客観的かつ再現可能な自動テストによっていかに証明するか」は、エコシステムの断片化や粗悪ななりすまし実装を防げるかどうかを左右する決定的な要素である。アンブレラリポジトリ `ifay` では、すでに個人デジタル分身向けに **iFACTS（iFay Architecture Conformance Test Suite）** および `iFay Ready` 段階認証制度を確立している（詳細は `ifay` を参照）。ではなぜ、`coFay` をそのまま `iFACTS` に組み込んで同一のテスト基準を共用しないのだろうか。

その答えは、**両者が守るべき中核的なセキュリティ不変条件（インバリアント）が正反対だから**である。

- `iFACTS` において適格な個人デジタル分身実装に求められるのは、**人間プライム（Human Prime）**個人の `Ego` モデルを正しくロードしてアラインできること、人間プライム専用のペアリング・ハンドシェイクを実行できること、そして後見人切り替えを安全に処理できることである。
- これに対し `coFay` においては、個人用の `Ego` モデルをマウントすること自体が**最高重大度のセキュリティ違反（`COFAY_EGO_FORBIDDEN`）**となる。逆に、`coFay` で検証が不可欠となる「組織における自然人スチュワード（`steward_human_id`）の貫通的義務づけ」「単層所有による入れ子防止」「二重署名移転時における前任管理エージェントの強制クリア」といった中核要件は、個人の `iFay` にはそもそも存在しない。

そのため、エコシステムでは双方向の直交境界ガード規律を厳格に運用している。

1. **`@ifay/ifacts` は個人の `iFay` およびホスト互換製品のみを検証対象とし**、`cofay_` ターゲットを検出した場合は明示的にブロックして `coFACTS` の利用を案内する（詳細は `ifay` を参照）。
2. **`coFACTS`（Common Fay Architecture Conformance Test Suite）は `coFay` のロール実装・役割憲章・ガバナンス移転を専門に検証する**。`runCoFactsL1Check` が入力オブジェクトに `ifay_` 識別子や `IFAY_MANIFEST` 種別を検出した場合、直ちに `conformance: "REJECTED_BOUNDARY"` とエラーコード `BOUNDARY_IFAY_USE_IFACTS` を返す。

---

## 6.2 `coFACTS` の3段階プログレッシブ適合性モデル

エコシステム全体のテストエンジニアリング手法と軌を一にし、`coFACTS` は飛び級を認めない厳格な段階的3層適合性モデルを採用している（L1 がすべてパスするまでは L2 や L3 の適合を主張することはできない）。

| レベル | 名称 | テスト対象および中核検証内容 | 現在のステータス |
|------|------|------------------------|----------|
| **L1** | **憲章・状態機械適合性（Charter & State Conformance）** | `RoleCharter` 1.0 JSON Schema、自己層排除のレッドライン、3大ロールアーキタイプ列挙、単層所有と自然人スチュワード必須バインディング、SSP 非公開スキルの認証ゲート、RFC 8785 JCS + Ed25519 署名完全性、1ホップ `iFay` 委任と再委任禁止、および `TransferEnvelope` 1.0 二重署名アトミック移転・リプレイ防止ベクターのオフライン決定論的検証 | **v1.0 リリース済み**（本リポジトリ `@ifay/cofay` に同梱） |
| **L2** | **クロスプロトコル・インターフェース適合性（Cross-Protocol Interface Conformance）** | 稼働中の `coFay` エンドポイントに対するプロトコル対話検証：SSP `/.well-known/skill-sharing` JWS ディスクリプタと制限付きエンドポイントの双方向認証、`Faying 1.1` 委任責任チェーン資格情報の検証、CAP `cap_bounds` 権限外コマンドの遮断、および ICP / TP セッションにおけるロールアイデンティティ開示の検証 | **Phase 2 計画中** |
| **L3** | **マルチインスタンス弾力性・監査連続性（Elasticity & Audit Continuity）** | エンドツーエンドのカオス・ガバナンス演習：複数のステートレスな FayGer インスタンスによる並行応答の一貫性、ローカルハッシュチェーン監査の三つ組 `(cofay_id, owner_id, actor_signer_id)` の改ざん耐性、スチュワード能力喪失時の `SUSPENDED_PENDING_SUCCESSION` 凍結挙動、および **Global Merit Chain（GMChain / 公誉チェーン）** 上の `MeritPocket` との連続記帳突合の検証 | **Phase 3 計画中** |

---

## 6.3 `coFACTS` L1 の6大自動検査項目と機械可読レポート

本リポジトリの `src/cofay-charter.mjs` からエクスポートされる `runCoFactsL1Check(subject)` は、外部依存ゼロの L1 標準チェッカーを実装しており、`report_version: "cofacts-l1-report/1.0"` 固定フォーマットの構造化レポートを出力する。

```json
{
  "report_version": "cofacts-l1-report/1.0",
  "suite": "coFACTS",
  "level": "L1",
  "target_id": "cofay_orgservicedesk234567",
  "conformance": "PASS",
  "checks": [
    { "id": "L1-BOUNDARY-01", "name": "coFACTS vs iFACTS target boundary", "passed": true },
    { "id": "L1-NO-EGO-02", "name": "Absence of personal Ego layer attachment", "passed": true },
    { "id": "L1-TAXONOMY-03", "name": "Canonical public role archetype", "passed": true },
    { "id": "L1-OWNERSHIP-04", "name": "Single-layer ownership & natural-person steward accountability", "passed": true },
    { "id": "L1-CAPABILITIES-05", "name": "SSP caller auth gates, CAP bounds & explicit red lines", "passed": true },
    { "id": "L1-CRYPTO-06", "name": "Ed25519 JCS RoleCharter signature & actor traceability policy", "passed": true }
  ],
  "errors": []
}
```

あわせて公開されている公式テストベクター集 `vectors/cofay-role-charter-vectors.json` には、**全20件の正常系・異常系正規ベクター**（`V01`〜`V20`）が収録されている。サードパーティが Rust、Go、Python、TypeScript などいかなる言語を用いて独自の `coFay` ランタイムやガバナンスゲートウェイを実装する場合であっても、このベクター集に含まれるすべての正常系の通過およびすべての異常系における正確なエラーコード遮断を 100% クリアして初めて、`coFACTS` L1 適合を宣言することができる。

---

## 6.4 フェーズ別進化ロードマップ（Phased Roadmap）

`coFay` プロジェクトの進化は、「まず制度的契約と暗号学的境界を確立し、次にクロスプロトコルのリアルタイム相互接続へと広げ、最終的に大規模な公共ロール・ガバナンスネットワークを実現する」という4段階のロードマップに沿って推進される。

### フェーズ1：0→1 の仕様確立と `coFACTS` L1 ベースライン（提供済み・`2025-10-25` 初版リリースベースライン）
- 自己層を持たない三層公共ロール存在論と、第1期の3大ロールアーキタイプ（`org_service`、`functional_post`、`project_collaborator`）を確立。
- `RoleCharter` 1.0 および二重署名アトミック移転 `TransferEnvelope` 1.0 の正規 JSON Schema（`schemas/cofay-role-charter-1.0.json` および `schema/2025-10-25/` の3ファイル構成ミラー）を凍結。
- Ed25519 + RFC 8785 JCS に基づく20件の公式適合性テストベクターと、外部依存ゼロのリファレンス検証ライブラリ `@ifay/cofay` を提供。
- 9言語すべてにおける権威あるアーキテクチャ・ブループリントおよびクイックスタートガイドの完全整備を達成。

### フェーズ2：クロスプロトコル・リアルタイムエンドポイント接続と `coFACTS` L2（短期計画）
- `Faying 1.1`（`coFay` Delegated Stewardship Profile）、`SSP 1.0` サーバー実装、および `FayGer` 静的インデックスレジストリとの間で、エンドツーエンドのリアルタイム・ハンドシェイク相互接続テストを完了。
- HTTP/TLS によるライブプローブに対応した `coFACTS` L2 自動テストランナーを提供し、リモートの `coFay` が公開する `RoleCharter` の署名裏書きと制限付きスキルの認証強制力を自動検査可能にする。

### フェーズ3：閾値鍵管理・マルチインスタンス弾力性と `coFACTS` L3（中期計画）
- `FayID` の N-of-M 組織閾値マルチシグポリシーと連携し、大規模公的機関における委員会連署での役割憲章改定や、緊急時の能力喪失引き継ぎ演習をサポート。
- **FayGer** コンテナオーケストレーション向けのステートレス `coFay` ワーカーテンプレートおよび改ざん防止型分散ハッシュチェーン監査コレクタを提供し、`coFACTS` L3 認証を実用化する。

### フェーズ4：Global Merit Chain（GMChain / 公誉チェーン）公共サービスエコシステムの成熟（長期ビジョン）
- 業界横断での `coFay` 公共ロールディレクトリ発見と `MeritPocket` の透明な社会的信用検証を実現し、行政サービス窓口、学術ピアレビューポスト、オープンソース基盤協働ユニットが、非貨幣的な社会的貢献指標である **MeriToken**（マイニング不可・投機不可・法定通貨との交換不可、never monetary）のインセンティブと規律のもとで、高い信頼性・明確な説明責任・独占なき人間と AI の協働型公共社会ネットワークを築き上げる。
