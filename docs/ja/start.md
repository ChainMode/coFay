# クイックスタート：coFay の理解と導入

**coFay（Common Fay、公共ロールデジタル分身）**の公式ドキュメントおよびリファレンスツールキットへようこそ。**Fay** エコシステムの中核をなす二元アーキテクチャ **`Fay = iFay + coFay`** において、`iFay`（Individual Fay）は特定の**人間プライム（Human Prime）**から複製され、生涯にわたりその個人とアラインし続ける個人デジタル分身です。これに対し、`coFay` は**標準化された役割憲章（`RoleCharter`）によって定義され、公開アドレス指定が可能な機能的公共ロール分身**です。

人間プライムが自身の管理下にある `iFay` を介してリクエストを発信する場合でも、他の `Fay` がリモート連携によって社会的サービスを呼び出す場合でも、呼び出し側は背後にいる特定の自然人オペレーターを意識する必要はありません。対象となる `cofay_<base32>` 公共ロールエンドポイントを指定して接続するだけで、安定的かつ検証可能で、追跡可能なコラボレーション能力を利用できます。

---

## 1. 3分で掴むコアメンタルモデル

`coFay` を正確に理解する鍵は、個人デジタル分身である `iFay` との間にある、アーキテクチャおよび倫理的境界における4つの本質的な違いを押さえることにあります。

| 比較軸 | `iFay`（個人デジタル分身） | `coFay`（公共ロール分身） |
|------|------------------------|------------------------|
| **存在論的性質** | 人間プライムの人格および個人的意思のデジタル的延長 | 引き継ぎ可能な公共職能ポスト、機関窓口、または協働ユニット |
| **アーキテクチャ階層** | ソーシャル層 + インタラクション層 + 認知層 + **自己層（Ego）** | **ソーシャル層 + インタラクション層 + 認知層（自己層 Ego のマウントを厳禁）** |
| **所有と移転** | 唯一の人間プライムに恒久的に紐づき、売買・移転は一切不可 | `HumanID` または `OrganizationID` に単層帰属し、二重署名によるアトミックな所有権移転に対応 |
| **適合性認証** | **iFACTS** 検証スイートが対象 | 独立した **coFACTS** 検証フレームワークが対象 |

> **設計上の重要レッドライン**：`Fay` エコシステムにおいて、**ホスト（Host）**という用語はインハビット（憑依・接続）対象の端末デバイスまたはソフトウェアアプリケーションのみを指し、自然人を指すことは決してありません。あらゆる `coFay` の法的・倫理的責任は最終的に必ず自然人（直接所有する `HumanID`、または組織所有下で登録が義務づけられた自然人スチュワード `steward_human_id`）にアンカーされます。

---

## 2. 環境準備と1分ローカル検証

本リポジトリには、外部ランタイム依存ゼロで動作する `RoleCharter` 1.0 正規 JSON Schema、20件の正常系・異常系暗号テストベクター、および `coFACTS` L1 適合性チェッカーが同梱されています。**Node.js 20+** さえあれば、ローカル環境ですぐに検証を実行できます。

```bash
git clone https://github.com/ChainMode/coFay.git
cd coFay
npm test
```

テストスイートを実行すると、以下の項目が順次に検証されます。

1. `schemas/cofay-role-charter-1.0.json` と `schema/2025-10-25/schema.json` のバイト単位での完全一致。
2. RFC 8785 JSON 正規化スキーム（JCS）に基づく決定論的シリアライゼーション。
3. 3つの正規公共ロールアーキタイプ（`org_service`、`functional_post`、`project_collaborator`）に対する Ed25519 署名および改ざん検知検証。
4. 自己層マウント禁止ルール（`ego_package` 等の装着を遮断）、単層所有ルール（`ifay_` や `cofay_` による入れ子保有を遮断）、および組織スチュワード必須制約。
5. 1ホップ限定の `iFay` 管理委任（所有者またはスチュワードによる権限付与を許可し、管理エージェントによる二次的な再委任を拒否）。
6. 二重署名によるアトミックな所有権移転（`TransferEnvelope` 1.0）における前任管理エージェントの一括クリア、リプレイ攻撃を防ぐ `transfer_nonce`、およびオンチェーンの **Global Merit Chain（GMChain / 公誉チェーン）** 上の `MeritPocket` 連続性。
7. `coFACTS` L1 適合性レポートの出力と、`iFay ↔ coFay` 間のテスト境界ガード。

---

## 3. 最初の `RoleCharter` 1.0 を作成・検証する

本番稼働するすべての `coFay` は、その所有主体（または組織の自然人スチュワード）によって Ed25519 署名された `RoleCharter` 1.0 ドキュメントを保持しなければなりません。

```js
import {
  signRoleCharter,
  validateRoleCharter,
  runCoFactsL1Check,
} from "@ifay/cofay";

const unsignedCharter = {
  schema_version: "1.0",
  charter_id: "chr_b4f2k7m5p3q6r4s2t4v6w3x2y4",
  charter_revision: 1,
  cofay_id: "cofay_c5g3m6n2q4r7s5t3v5w7x4y3z5",
  display_name: "市政公共許認可受付窓口",
  role_archetype: "org_service",
  owner: {
    type: "organization",
    id: "org_civic-service-bureau",
  },
  steward_human_id: "hid_a3d5f7g4j2k4m6n5p2q4r6s7t2",
  managers: ["ifay_m2n4p6q7r2s4t6v5w2x4y6z2a4"],
  mission_statement: "市政サービス局を代表し、標準化された業務相談、提出書類の一次審査、および進捗照会サービスを対外的に提供する。",
  allowed_capabilities: {
    ssp_skills: [
      {
        skill_ref: "ssp://org_civic-service-bureau/permit-inquiry@1.0",
        visibility: "public",
        require_caller_auth: false,
      },
      {
        skill_ref: "ssp://org_civic-service-bureau/permit-filing@1.0",
        visibility: "restricted",
        require_caller_auth: true,
      },
    ],
    cap_bounds: {
      allowed_scopes: ["cap:document.verify", "cap:queue.dispatch"],
      max_autonomy_tier: "delegated",
      allow_irreversible_actions: false,
    },
  },
  prohibited_actions: [
    "いかなる人間プライムへのなりすまし、および個人用 Ego 人格パッケージのロードを厳禁とする。",
    "自然人スチュワードによる再審査署名なしに最終的な行政取消決定を下すことを厳禁とする。",
  ],
  audit_policy: {
    retention_days: 365,
    log_mode: "hash_chain",
    require_actor_trace: true,
    gmc_merit_pocket_ref: "mpk_c5g3m6n2q4r7s5t3v5w7x4y3z5",
  },
  lifecycle_state: "ACTIVE",
  transfer_nonce: 0,
  issued_at: "2026-11-16T00:00:00Z",
};

const signedCharter = signRoleCharter(unsignedCharter, {
  signerId: unsignedCharter.steward_human_id,
  privateKeySeedHex: "0202020202020202020202020202020202020202020202020202020202020202",
});

console.log(validateRoleCharter(signedCharter)); // { valid: true, errors: [] }
console.log(runCoFactsL1Check(signedCharter).conformance); // "PASS"
```

---

## 4. ブループリント章別ナビゲーション

`coFay` の設計哲学とクロスプロトコル連携メカニズムを体系的に習得するため、本リポジトリの権威あるアーキテクチャ・ブループリント全6章を順番に読み進めることを推奨します。

1. **[第1章：概要と存在論的位置づけ](./blueprint/01-概要と存在論的位置づけ.md)** —— `Fay = iFay + coFay` という二元的社会分業と、資産型の公共ロール分身と人格延長型の個人デジタル分身との根本的な境界を解き明かします。
2. **[第2章：自己層を持たない三層アーキテクチャと役割憲章](./blueprint/02-自己層を持たない三層アーキテクチャと役割憲章.md)** —— なぜ `coFay` が自己層（Ego）を排除し、代わりに `RoleCharter` 1.0 によってソーシャル層・インタラクション層・認知層を統御するのかを詳しく分析します。
3. **[第3章：公共ロール分類と活用シナリオ](./blueprint/03-公共ロール分類と活用シナリオ.md)** —— `org_service`、`functional_post`、`project_collaborator` という3つの正規ロールアーキタイプの能力モデルと実践的な導入形態を解説します。
4. **[第4章：単層所有と直交委任およびスチュワード説明責任](./blueprint/04-単層所有と直交委任およびスチュワード説明責任.md)** —— `FayID`、`Faying 1.1`、`SSP`、`CAP`、`GMChain` の5大基盤プロトコルにまたがる権限・責任チェーンと、再委任禁止の規律を整理します。
5. **[第5章：ステートレス実行と連続的評価および二重署名移転](./blueprint/05-ステートレス実行と連続的評価および二重署名移転.md)** —— マルチインスタンスの水平オートスケーリングが単一の `MeritPocket` とどう両立するか、そして `TransferEnvelope` 1.0 による二重署名アトミック移転と前任管理エージェントのクリア機構を紐解きます。
6. **[第6章：coFACTS適合性フレームワークとロードマップ](./blueprint/06-coFACTS適合性フレームワークとロードマップ.md)** —— `coFACTS` の段階的検証モデル、`iFACTS` との直交する責務境界、およびフェーズ別の進化計画を網羅します。
