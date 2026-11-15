# 06. coFACTS 一致性框架與演進路線圖

## 6.1 為什麼必須劃定 `iFACTS` 與 `coFACTS` 的正交邊界

在開放協定生態中，「如何以客觀、可重現的自動化測試證明某個實作確實遵守規範」，決定了生態能否避免碎片化與偽劣冒充。傘型儲存庫 `ifay` 已經為個體數位化身建立了 **iFACTS（iFay Architecture Conformance Test Suite）** 與 `iFay Ready` 分級驗證體系（詳見 `ifay`）。那麼，為什麼不直接把 `coFay` 塞進 `iFACTS` 裡共用同一套測試判準？

答案在於**兩者的核心安全不變量截然相反**：
- 在 `iFACTS` 中，一個合格的個體化身實作必須驗證它能否正確載入並對齊**人類原型（Human Prime）**的個人 `Ego` 模型、能否執行人類原型專屬配對握手與監護人切換；
- 而在 `coFay` 中，掛載任何個人 `Ego` 模型恰恰是**最高等級的資安違規（`COFAY_EGO_FORBIDDEN`）**。反之，`coFay` 必須檢核的組織自然人主理人（`steward_human_id`）強制穿透、單層歸屬防巢狀持有、雙簽過戶時前任管理代理強制清除等核心條款，在個體 `iFay` 上根本不存在。

因此，生態嚴格執行雙向正交攔截紀律：
1. **`@ifay/ifacts` 僅驗證個體 `iFay` 與宿主相容產品**，遇到 `cofay_` 目標時會明確攔截並引導至 `coFACTS`（詳見 `ifay`）；
2. **`coFACTS`（Common Fay Architecture Conformance Test Suite）專門負責驗證 `coFay` 角色實作、章程與治理流轉**；當 `runCoFactsL1Check` 偵測到輸入物件帶有 `ifay_` 識別碼或 `IFAY_MANIFEST` 類型時，會立即回傳 `conformance: "REJECTED_BOUNDARY"` 與錯誤碼 `BOUNDARY_IFAY_USE_IFACTS`。

---

## 6.2 `coFACTS` 三級遞進一致性模型

與生態測試工程方法論對齊，`coFACTS` 採用嚴格遞進、不可跳級的三層符合性模型（在 L1 全數通過之前，不得宣稱 L2/L3 合規）：

| 層級 | 名稱 | 受測對象與核心驗證內容 | 當前狀態 |
|------|------|------------------------|----------|
| **L1** | **章程與狀態機符合性（Charter & State Conformance）** | 離線確定性驗證 `RoleCharter` 1.0 JSON Schema、無自我層紅線、三大角色原型列舉、單層歸屬與自然人主理人強制綁定、SSP 非公開技能權限驗證門禁、RFC 8785 JCS + Ed25519 簽章完整性、單跳 `iFay` 委託禁轉授，以及 `TransferEnvelope` 1.0 雙簽原子過戶與防重放向量 | **v1.0 已交付**（內建於本儲存庫 `@ifay/cofay`） |
| **L2** | **跨協定介面符合性（Cross-Protocol Interface Conformance）** | 針對執行態 `coFay` 端點的協定互動驗證：核驗 SSP `/.well-known/skill-sharing` JWS 描述符與受限端點雙向驗證、`Faying 1.1` 委託責任鏈憑證核驗、CAP `cap_bounds` 越權指令攔截，以及 ICP / TP 工作階段中的角色身分揭露 | **Phase 2 規劃** |
| **L3** | **多執行個體彈性與稽核連續性（Elasticity & Audit Continuity）** | 端對端混沌工程與治理演練：驗證多個無狀態 FayGer 執行個體並行回應的一致性、本機雜湊鏈稽核三元組 `(cofay_id, owner_id, actor_signer_id)` 防竄改完整性、主理人失能轉入 `SUSPENDED_PENDING_SUCCESSION` 凍結表現，以及與 **公譽鏈（GMChain）** `MeritPocket` 的連續記帳對帳 | **Phase 3 規劃** |

---

## 6.3 `coFACTS` L1 六大自動化檢查項目與機器可讀報告

本儲存庫 `src/cofay-charter.mjs` 匯出的 `runCoFactsL1Check(subject)` 實作了零外部相依性的 L1 標準檢查器，固定輸出 `report_version: "cofacts-l1-report/1.0"` 結構化報告：

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

隨附發布的官方測試向量集 `vectors/cofay-role-charter-vectors.json` 共收錄 **20 組正反規範向量**（`V01`–`V20`）。第三方無論使用 Rust、Go、Python 還是 TypeScript 實作自己的 `coFay` 執行環境與治理閘道，都必須 100% 通過該向量集的全部正例放行與反例精確錯誤碼攔截，方可宣稱通過 `coFACTS` L1。

---

## 6.4 分階段演進路線圖（Phased Roadmap）

`coFay` 專案的演進遵循「先立制度契約與密碼學邊界，再擴展跨協定即時連線整合，最終實現規模化公共角色治理網路」的四階段路線：

### 第一階段：0→1 規範破冰與 `coFACTS` L1 基準線（當前已交付 · `2025-10-25` 首發版次基準）
- 確立無自我層三層公共角色本體與三大首期角色原型（`org_service`、`functional_post`、`project_collaborator`）；
- 凍結 `RoleCharter` 1.0 與雙簽原子過戶 `TransferEnvelope` 1.0 規範 JSON Schema（`schemas/cofay-role-charter-1.0.json` 及 `schema/2025-10-25/` 三件套鏡像）；
- 交付 20 組 Ed25519 + RFC 8785 JCS 官方符合性測試向量與零相依性 `@ifay/cofay` 參考檢核函式庫；
- 完成 9 語系權威架構藍圖與快速入門指南全量涵蓋。

### 第二階段：跨協定即時端點接入與 `coFACTS` L2（近期演進）
- 與 `Faying 1.1`（`coFay` Delegated Stewardship Profile）、`SSP 1.0` 伺服端及 `FayGer` 靜態索引註冊表完成端對端即時握手整合測試；
- 交付支援 HTTP/TLS 即時探測的 `coFACTS` L2 自動化執行器，自動查驗遠端 `coFay` 公開的 `RoleCharter` 背書與受限技能驗證強制力。

### 第三階段：門檻金鑰託管、多執行個體彈性與 `coFACTS` L3（中期演進）
- 介接 `FayID` N-of-M 組織門檻多重簽章策略，支援大型公共機構的委員會連署章程修訂與緊急失能接管演練；
- 提供針對 **FayGer** 容器編排的無狀態 `coFay` Worker 範本與防竄改分散式雜湊鏈稽核彙整器，落地 `coFACTS` L3 驗證。

### 第四階段：公譽鏈（GMChain）公共服務生態繁榮（遠期願景）
- 實現跨產業 `coFay` 公共角色名錄探索與 `MeritPocket` 透明公信力檢視，讓市政公共窗口、學術同儕審查席位、開源基礎設施協作單元在非貨幣**美譽值（MeriToken）**的激勵與約束下，建構高可信、可問責、零壟斷的人機協同公共社會網路。
