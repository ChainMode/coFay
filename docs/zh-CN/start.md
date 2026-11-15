# 快速开始：认识与接入 coFay

欢迎来到 **coFay（Common Fay，公共角色数字化身）** 官方文档与参考工具库。在 **Fay** 生态的核心二元架构 **`Fay = iFay + coFay`** 中，`iFay`（Individual Fay）是从特定**人类原型（Human Prime）**复刻并与其终身对齐的个体数字化身；而 `coFay` 则是**由规范角色章程（`RoleCharter`）定义、可公开寻址的功能性公共角色化身**。

无论是人类原型经由受监护的 `iFay` 发起请求，还是其他 `Fay` 远程协同调用某项社会化服务，调用方都无需锁定背后的某个具体自然人操作员，只需寻址并连接对应的 `cofay_<base32>` 公共角色端点即可获得稳定、可验证、可追溯的协作能力。

---

## 1. 三分钟建立核心心智模型

理解 `coFay` 的关键，在于把握它与个体化身 `iFay` 在架构与伦理边界上的四项本质差异：

| 维度 | `iFay`（个体数字化身） | `coFay`（公共角色化身） |
|------|------------------------|------------------------|
| **本体属性** | 人类原型人格与个人意志的数字延伸 | 可移交的公共职能席位、机构窗口或协作单元 |
| **架构层级** | 社交层 + 交互层 + 认知层 + **自我层（Ego）** | **社交层 + 交互层 + 认知层（严禁挂载自我层 Ego）** |
| **归属与过户** | 永久绑定唯一人类原型，不可买卖或过户 | 单层归属于 `HumanID` 或 `OrganizationID`，支持双签原子过户 |
| **符合性认证** | 由 **iFACTS** 验证套件覆盖 | 由独立的 **coFACTS** 验证框架覆盖 |

> **关键设计红线**：在 `Fay` 生态中，**宿主（Host）**一词仅指被附身的终端设备或软件应用，绝不指代自然人。任何 `coFay` 的法律与伦理责任最终均锚定至自然人（直接归属的 `HumanID`，或组织归属下强制登记的自然人主理人 `steward_human_id`）。

---

## 2. 环境准备与一分钟本地校验

本仓库内置了零外部运行时依赖的 `RoleCharter` 1.0 规范 Schema、20 条正反密码学测试向量以及 `coFACTS` L1 符合性检查器。只需 **Node.js 20+** 即可在本地直接运行验证：

```bash
git clone https://github.com/ChainMode/coFay.git
cd coFay
npm test
```

运行成功后，测试套件将依次校验：
1. `schemas/cofay-role-charter-1.0.json` 与 `schema/2025-10-25/schema.json` 的逐字节等价性；
2. RFC 8785 JSON 规范化方案（JCS）的确定性序列化；
3. 三大规范公共角色原型（`org_service`、`functional_post`、`project_collaborator`）的 Ed25519 签名与防篡改验签；
4. 无自我层禁令（拦截 `ego_package` 挂载）、单层归属禁令（拦截 `ifay_` / `cofay_` 嵌套持有）与组织主理人强制约束；
5. 单跳 `iFay` 管理委托（允许归属方或主理人授权，拒绝管理代理二次转委托）；
6. 双签原子所有权过户（`TransferEnvelope` 1.0）中的前任管理代理清空、防重放 `transfer_nonce` 与链上 **公誉链（GMChain）** `MeritPocket` 连续性；
7. `coFACTS` L1 符合性报告输出及 `iFay ↔ coFay` 测试边界拦截。

---

## 3. 创建并校验你的第一份 `RoleCharter` 1.0

每个正式上线的 `coFay` 都必须持有一份由其归属主体（或组织自然人主理人）通过 Ed25519 签发的 `RoleCharter` 1.0 文档：

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
  display_name: "市政公共许可受理席",
  role_archetype: "org_service",
  owner: {
    type: "organization",
    id: "org_civic-service-bureau",
  },
  steward_human_id: "hid_a3d5f7g4j2k4m6n5p2q4r6s7t2",
  managers: ["ifay_m2n4p6q7r2s4t6v5w2x4y6z2a4"],
  mission_statement: "代表市政服务局对外提供标准化业务咨询、材料初审与进度查询服务。",
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
    "严禁冒充任何人类原型或加载个人 Ego 人格包。",
    "严禁在未经人类主理人复核签名的情况下作出终局行政撤销决定。",
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

## 4. 蓝图章节导航

建议按顺序阅读本仓库的 6 章权威架构蓝图，完整掌握 `coFay` 的设计哲学与跨协议协同机制：

1. **[第 1 章：概述与本体定位](./blueprint/01-概述与本体定位.md)** —— 深入理解 `Fay = iFay + coFay` 二元社会分工，以及资产型公共角色化身与人格延伸型个体化身的根本分野。
2. **[第 2 章：无自我层三层架构与角色章程](./blueprint/02-无自我层三层架构与角色章程.md)** —— 剖析为何 `coFay` 剪裁掉自我层（Ego），转而以 `RoleCharter` 1.0 驱动社交层、交互层与认知层。
3. **[第 3 章：公共角色分类与应用场景](./blueprint/03-公共角色分类与应用场景.md)** —— 详解 `org_service`、`functional_post` 与 `project_collaborator` 三大规范原型的能力模型与实战落地形态。
4. **[第 4 章：单层归属、正交委托与主理人问责](./blueprint/04-单层归属正交委托与主理人问责.md)** —— 梳理 `FayID`、`Faying 1.1`、`SSP`、`CAP` 与 `GMChain` 五大基础设施间的权责链路与不可再委托纪律。
5. **[第 5 章：无状态运行、连续声誉与双签过户](./blueprint/05-无状态运行连续声誉与双签过户.md)** —— 解析多实例水平扩缩容如何与唯一 `MeritPocket` 自洽，以及 `TransferEnvelope` 1.0 双签原子过户与代理清理机制。
6. **[第 6 章：coFACTS 一致性框架与演进路线图](./blueprint/06-coFACTS一致性框架与演进路线图.md)** —— 掌握 `coFACTS` 分级验证体系、与 `iFACTS` 的正交边界及分阶段演进计划。
