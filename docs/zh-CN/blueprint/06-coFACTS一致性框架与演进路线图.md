# 06. coFACTS 一致性框架与演进路线图

## 6.1 为什么必须划定 `iFACTS` 与 `coFACTS` 的正交边界

在开放协议生态中，「如何用客观、可复现的自动化测试证明某个实现真正遵守了规范」决定了生态能否避免碎片化与伪劣冒充。伞仓库 `ifay` 已经为个体数字化身建立了 **iFACTS（iFay Architecture Conformance Test Suite）** 与 `iFay Ready` 分级认证体系（详见 `ifay`）。那么，为什么不直接把 `coFay` 塞进 `iFACTS` 里共用同一套测试判据？

答案在于**两者的核心安全不变量截然相反**：
- 在 `iFACTS` 中，一个合格的个体化身实现需要验证它能否正确加载并对齐**人类原型（Human Prime）**的个人 `Ego` 模型、能否执行人类原型专属配对握手与监护人切换；
- 而在 `coFay` 中，挂载任何个人 `Ego` 模型恰恰是**最高级别的安全违规（`COFAY_EGO_FORBIDDEN`）**！反之，`coFay` 必须验证的组织自然人主理人（`steward_human_id`）强制穿透、单层归属防嵌套、双签过户时前任管理代理强制清空等核心条款，在个体 `iFay` 上根本不存在。

因此，生态严格执行双向正交拦截纪律：
1. **`@ifay/ifacts` 仅验证个体 `iFay` 与宿主兼容产品**，遇到 `cofay_` 目标时显式拦截并引导至 `coFACTS`（详见 `ifay`）；
2. **`coFACTS`（Common Fay Architecture Conformance Test Suite）专门负责验证 `coFay` 角色实现、章程与治理流转**；当 `runCoFactsL1Check` 检测到输入对象携带 `ifay_` 标识或 `IFAY_MANIFEST` 类型时，立即返回 `conformance: "REJECTED_BOUNDARY"` 与错误码 `BOUNDARY_IFAY_USE_IFACTS`。

---

## 6.2 `coFACTS` 三级递进一致性模型

与生态测试工程方法论对齐，`coFACTS` 采用严格递进、不可跳级的三层符合性模型（L1 未全绿之前不得声称 L2/L3 合规）：

| 层级 | 名称 | 被测对象与核心验证内容 | 当前状态 |
|------|------|------------------------|----------|
| **L1** | **章程与状态机符合性（Charter & State Conformance）** | 离线确定性验证 `RoleCharter` 1.0 JSON Schema、无自我层红线、三大角色原型枚举、单层归属与自然人主理人强制绑定、SSP 非公开技能鉴权门禁、RFC 8785 JCS + Ed25519 签名完整性、单跳 `iFay` 委托禁转授，以及 `TransferEnvelope` 1.0 双签原子过户与防重放向量 | **v1.0 已交付**（内置于本仓 `@ifay/cofay`） |
| **L2** | **跨协议接口符合性（Cross-Protocol Interface Conformance）** | 针对运行态 `coFay` 端点的协议交互验证：核验 SSP `/.well-known/skill-sharing` JWS 描述符与受限端点双向鉴权、`Faying 1.1` 委托责任链凭证核验、CAP `cap_bounds` 越权指令拦截，以及 ICP / TP 会话中的角色身份披露 | **Phase 2 规划** |
| **L3** | **多实例弹性与审计连续性（Elasticity & Audit Continuity）** | 端到端混沌与治理演练：验证多无状态 FayGer 实例并发响应的一致性、本地哈希链审计三元组 `(cofay_id, owner_id, actor_signer_id)` 防篡改完整性、主理人失能转入 `SUSPENDED_PENDING_SUCCESSION` 冻结表现，以及与 **公誉链（GMChain）** `MeritPocket` 的连续记账对账 | **Phase 3 规划** |

---

## 6.3 `coFACTS` L1 六大自动化检查项与机器可读报告

本仓库 `src/cofay-charter.mjs` 导出的 `runCoFactsL1Check(subject)` 实现了零外部依赖的 L1 标准检查器，固定输出 `report_version: "cofacts-l1-report/1.0"` 结构化报告：

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

配套发布的官方测试向量集 `vectors/cofay-role-charter-vectors.json` 共收录 **20 条正反规范向量**（`V01`–`V20`），第三方无论使用 Rust、Go、Python 还是 TypeScript 实现自己的 `coFay` 运行时与治理网关，都必须 100% 通过该向量集的全部正例放行与反例精确错误码拦截，方可声称通过 `coFACTS` L1。

---

## 6.4 分阶段演进路线图（Phased Roadmap）

`coFay` 项目的演进遵循「先立制度契约与密码学边界，再扩跨协议实时联调，最终实现规模化公共角色治理网络」的四阶段路线：

### 第一阶段：0→1 规范破冰与 `coFACTS` L1 基线（当前已交付 · `2025-10-25` 首发版次基线）
- 确立无自我层三层公共角色本体与三大首期角色原型（`org_service`、`functional_post`、`project_collaborator`）；
- 冻结 `RoleCharter` 1.0 与双签原子过户 `TransferEnvelope` 1.0 规范 JSON Schema（`schemas/cofay-role-charter-1.0.json` 及 `schema/2025-10-25/` 三件套镜像）；
- 交付 20 条 Ed25519 + RFC 8785 JCS 官方符合性测试向量与零依赖 `@ifay/cofay` 参考校验库；
- 完成 9 语种权威架构蓝图与快速入门指南全量覆盖。

### 第二阶段：跨协议实时端点接入与 `coFACTS` L2（近期演进）
- 与 `Faying 1.1`（`coFay` Delegated Stewardship Profile）、`SSP 1.0` 服务端及 `FayGer` 静态索引注册表完成端到端实时握手联调；
- 交付支持 HTTP/TLS 实时探测的 `coFACTS` L2 自动化运行器，自动查验远端 `coFay` 暴露的 `RoleCharter` 背书与受限技能鉴权强制力。

### 第三阶段：门限密钥托管、多实例弹性与 `coFACTS` L3（中期演进）
- 对接 `FayID` N-of-M 组织门限多签策略，支持大型公共机构的委员会联署章程修订与紧急失能接管演练；
- 提供面向 **FayGer** 容器编排的无状态 `coFay` Worker 模板与防篡改分布式哈希链审计归集器，落地 `coFACTS` L3 认证。

### 第四阶段：公誉链（GMChain）公共服务生态繁荣（远期愿景）
- 实现跨行业 `coFay` 公共角色名录发现与 `MeritPocket` 透明公信力审视，让市政公共窗口、学术同行评议席位、开源基础设施协作单元在非货币**美誉值（MeriToken）**的激励与约束下，构建高可信、可追责、零垄断的人机协同公共社会网络。
