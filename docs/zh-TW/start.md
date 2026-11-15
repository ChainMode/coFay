# 快速開始：認識與接入 coFay

歡迎來到 **coFay（Common Fay，公共角色數位化身）** 官方文件與參考工具庫。在 **Fay** 生態的核心二元架構 **`Fay = iFay + coFay`** 之中，`iFay`（Individual Fay）是從特定**人類原型（Human Prime）**復刻並與其終身對齊的個體數位化身；而 `coFay` 則是**由規範角色章程（`RoleCharter`）定義、可公開尋址的功能性公共角色化身**。

無論是人類原型經由受監護的 `iFay` 發起請求，或是其他 `Fay` 遠端協同呼叫某項社會化服務，呼叫端都無需鎖定背後的某位特定自然人作業人員，只需尋址並連線至對應的 `cofay_<base32>` 公共角色端點，即可獲得穩定、可驗證且可追溯的協作能力。

---

## 1. 三分鐘建立核心心智模型

理解 `coFay` 的關鍵，在於掌握它與個體化身 `iFay` 在系統架構與倫理邊界上的四項本質差異：

| 維度 | `iFay`（個體數位化身） | `coFay`（公共角色化身） |
|------|------------------------|------------------------|
| **本體屬性** | 人類原型人格與個人意志的數位延伸 | 可移交的公共職能席位、機構窗口或專案協作單元 |
| **架構層級** | 社交層 + 互動層 + 認知層 + **自我層（Ego）** | **社交層 + 互動層 + 認知層（嚴禁掛載自我層 Ego）** |
| **歸屬與過戶** | 永久綁定唯一人類原型，不可買賣或過戶 | 單層歸屬於 `HumanID` 或 `OrganizationID`，支援雙簽原子過戶 |
| **符合性驗證** | 由 **iFACTS** 驗證套件涵蓋 | 由獨立的 **coFACTS** 驗證框架涵蓋 |

> **關鍵設計紅線**：在 `Fay` 生態中，**宿主（Host）**一詞僅指被附身的終端硬體裝置或軟體應用，絕不指稱自然人。任何 `coFay` 的法律與倫理責任最終均錨定至自然人（直接歸屬的 `HumanID`，或組織歸屬下強制登記的自然人主理人 `steward_human_id`）。

---

## 2. 環境準備與一分鐘本機檢核

本儲存庫內建零外部執行時期相依性的 `RoleCharter` 1.0 規範結構描述（Schema）、20 組正反密碼學測試向量，以及 `coFACTS` L1 符合性檢查器。只需安裝 **Node.js 20+**，即可在本機直接執行完整驗證：

```bash
git clone https://github.com/ChainMode/coFay.git
cd coFay
npm test
```

執行成功後，測試套件將依序檢核以下項目：
1. `schemas/cofay-role-charter-1.0.json` 與 `schema/2025-10-25/schema.json` 的逐位元組等價性；
2. RFC 8785 JSON 正規化方案（JCS）的確定性序列化；
3. 三大規範公共角色原型（`org_service`、`functional_post`、`project_collaborator`）的 Ed25519 簽章與防竄改驗章；
4. 無自我層禁令（攔截 `ego_package` 掛載）、單層歸屬禁令（攔截 `ifay_` / `cofay_` 巢狀持有）與組織自然人主理人強制約束；
5. 單跳 `iFay` 管理委託（僅允許歸屬方或主理人授權，拒絕管理代理二次轉委託）；
6. 雙簽原子所有權過戶（`TransferEnvelope` 1.0）中的前任管理代理清除、防重放 `transfer_nonce`，以及鏈上 **公譽鏈（GMChain）** `MeritPocket` 連續性；
7. `coFACTS` L1 符合性報告輸出與 `iFay ↔ coFay` 測試邊界攔截。

---

## 3. 建立並檢核你的第一份 `RoleCharter` 1.0

每個正式上線的 `coFay` 都必須持有一份由其歸屬主體（或組織自然人主理人）透過 Ed25519 簽發的 `RoleCharter` 1.0 文件：

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
  display_name: "市政公共許可受理席",
  role_archetype: "org_service",
  owner: {
    type: "organization",
    id: "org_civic-service-bureau",
  },
  steward_human_id: "hid_a3d5f7g4j2k4m6n5p2q4r6s7t2",
  managers: ["ifay_m2n4p6q7r2s4t6v5w2x4y6z2a4"],
  mission_statement: "代表市政服務局對外提供標準化業務諮詢、資料初審與進度查詢服務。",
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
    "嚴禁冒充任何人類原型或載入個人 Ego 人格套件。",
    "嚴禁在未經人類主理人複核簽章的情況下作出終局行政撤銷處分。",
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

## 4. 藍圖章節導覽

建議依序閱讀本儲存庫的 6 章權威架構藍圖，完整掌握 `coFay` 的設計哲學與跨協定協同機制：

1. **[第 1 章：概述與本體定位](./blueprint/01-概述與本體定位.md)**：深入理解 `Fay = iFay + coFay` 二元社會分工，以及資產型公共角色化身與人格延伸型個體化身的根本分野。
2. **[第 2 章：無自我層三層架構與角色章程](./blueprint/02-無自我層三層架構與角色章程.md)**：剖析為何 `coFay` 裁剪掉自我層（Ego），轉而以 `RoleCharter` 1.0 驅動社交層、互動層與認知層。
3. **[第 3 章：公共角色分類與應用場景](./blueprint/03-公共角色分類與應用場景.md)**：詳解 `org_service`、`functional_post` 與 `project_collaborator` 三大規範原型的能力模型與實務落地形態。
4. **[第 4 章：單層歸屬、正交委託與主理人問責](./blueprint/04-單層歸屬正交委託與主理人問責.md)**：梳理 `FayID`、`Faying 1.1`、`SSP`、`CAP` 與 `GMChain` 五大基礎設施之間的權責鏈路與不可再委託紀律。
5. **[第 5 章：無狀態執行、連續聲譽與雙簽過戶](./blueprint/05-無狀態執行連續聲譽與雙簽過戶.md)**：解析多執行個體水平擴縮如何與唯一 `MeritPocket` 自洽，以及 `TransferEnvelope` 1.0 雙簽原子過戶與前任代理清理機制。
6. **[第 6 章：coFACTS 一致性框架與演進路線圖](./blueprint/06-coFACTS一致性框架與演進路線圖.md)**：掌握 `coFACTS` 分級驗證體系、與 `iFACTS` 的正交邊界及分階段演進計畫。
