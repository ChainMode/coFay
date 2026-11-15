# 빠른 시작: coFay 이해와 연동 가이드

**coFay(Common Fay, 공공 역할 디지털 화신)** 공식 문서 및 레퍼런스 툴킷 저장소에 오신 것을 환영합니다. **Fay** 생태계의 핵심 이원 아키텍처 공식인 **`Fay = iFay + coFay`**에서 `iFay`(Individual Fay)는 특정 **인간 프라임(Human Prime)**으로부터 복제(Instantiate)되어 평생 정렬을 유지하는 개인 디지털 화신인 반면, `coFay`는 **표준 역할 헌장(`RoleCharter`)으로 정의되고 공개 주소로 호출할 수 있는 기능성 공공 역할 화신**입니다.

인간 프라임이 자신의 후견 아래 있는 `iFay`를 통해 서비스를 요청하든, 다른 `Fay`가 원격 협업을 위해 사회적 공용 기능을 호출하든, 호출자는 배후에서 근무 중인 특정 자연인 담당자를 일일이 지정할 필요가 없습니다. 오직 공개된 `cofay_<base32>` 공공 역할 엔드포인트를 조회하고 연결하기만 하면 안정적이고 검증 가능하며 책임 추적이 보장되는 협업 역량을 즉시 활용할 수 있습니다.

---

## 1. 3분 만에 잡는 핵심 멘탈 모델

`coFay`를 정확히 이해하려면 개인 화신인 `iFay`와 아키텍처 및 윤리 경계에서 어떻게 갈라지는지 네 가지 본질적 차이를 파악해야 합니다.

| 비교 차원 | `iFay` (개인 디지털 화신) | `coFay` (공공 역할 화신) |
|------|------------------------|------------------------|
| **존재론적 속성** | 인간 프라임의 인격과 개인 의지가 확장된 디지털 분신 | 이관 가능한 공공 직무 석(席), 기관 창구 또는 협업 유닛 |
| **아키텍처 계층** | 소셜 계층 + 상호작용 계층 + 인지 계층 + **자아 계층(Ego)** | **소셜 계층 + 상호작용 계층 + 인지 계층 (자아 계층 Ego 탑재 엄격 금지)** |
| **소유 귀속 및 이전** | 유일한 인간 프라임에게 영구 귀속되며 매매·양도 불가 | `HumanID` 또는 `OrganizationID`에 단일 계층으로 귀속되며 이중 서명 원자적 소유권 이전 지원 |
| **적합성 인증 체계** | **iFACTS** 검증 스위트가 담당 | 독립된 **coFACTS** 적합성 검증 프레임워크가 담당 |

> **핵심 설계 레드라인**: `Fay` 생태계에서 **호스트(Host)**라는 용어는 화신이 깃드는(Inhabit) 단말 기기나 소프트웨어 애플리케이션만을 가리키며, 결코 자연인을 지칭하지 않습니다. 모든 `coFay`의 법적·윤리적 최종 책임은 언제나 자연인에게 고정됩니다(개인 직접 소유 시 해당 `HumanID`, 조직 소유 시 의무 등록된 자연인 스튜어드 `steward_human_id`).

---

## 2. 실행 환경 준비와 1분 로컬 검증

이 저장소에는 외부 런타임 의존성이 전혀 없는(Zero-dependency) `RoleCharter` 1.0 표준 JSON Schema, 20개의 정방향·역방향 암호학 테스트 벡터, 그리고 `coFACTS` L1 적합성 검사기가 기본 내장되어 있습니다. **Node.js 20+**만 설치되어 있다면 로컬 환경에서 즉시 전체 검증을 실행할 수 있습니다.

```bash
git clone https://github.com/ChainMode/coFay.git
cd coFay
npm test
```

테스트 스위트가 실행되면 다음 일곱 가지 핵심 불변식을 순차적으로 검증합니다.

1. `schemas/cofay-role-charter-1.0.json`과 `schema/2025-10-25/schema.json` 간의 바이트 단위 완전 동치성 검증
2. RFC 8785 JSON 정규화 스킴(JCS, JSON Canonicalization Scheme)에 기반한 결정론적 직렬화 검증
3. 3대 표준 공공 역할 아키타입(`org_service`, `functional_post`, `project_collaborator`)에 대한 Ed25519 서명 생성 및 위변조 탐지 검증
4. 자아 계층 탑재 금지(`ego_package` 등 차단), 단일 계층 소유 강제(`ifay_` / `cofay_` 중첩 소유 차단), 조직 소유 시 자연인 스튜어드 의무 지정 제약 검증
5. 단일 홉(Single-hop) `iFay` 운영 위임 규칙 검증(소유 주체 또는 스튜어드의 위임 부여는 허용하되, 위임 관리자의 재위임 시도는 즉시 거부)
6. 이중 서명 원자적 소유권 이전(`TransferEnvelope` 1.0) 시 전임 위임 관리자 초기화, 리플레이 공격 방지용 `transfer_nonce` 단조 증가, 온체인 **공예체인(GMChain)** `MeritPocket` 연속성 보장 검증
7. `coFACTS` L1 기계 판독형 적합성 리포트 출력 및 `iFay`와 `coFay` 간 테스트 대상 경계 차단 검증

---

## 3. 첫 번째 `RoleCharter` 1.0 작성 및 검증하기

프로덕션 환경에 배포되는 모든 `coFay`는 반드시 소유 주체(또는 조직의 자연인 스튜어드)가 Ed25519 개인키로 서명하여 발행한 `RoleCharter` 1.0 문서를 보유해야 합니다. 아래 예제는 시정 공공 인허가 접수 창구 역할을 정의하고 서명한 뒤 `coFACTS` L1 검사를 통과시키는 전체 흐름을 보여줍니다.

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
  display_name: "시정 공공 인허가 접수 창구",
  role_archetype: "org_service",
  owner: {
    type: "organization",
    id: "org_civic-service-bureau",
  },
  steward_human_id: "hid_a3d5f7g4j2k4m6n5p2q4r6s7t2",
  managers: ["ifay_m2n4p6q7r2s4t6v5w2x4y6z2a4"],
  mission_statement: "시정서비스국을 대표하여 표준화된 민원 안내, 제출 서류 사전 검토 및 처리 현황 조회 서비스를 제공합니다.",
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
    "어떠한 인간 프라임도 사칭해서는 안 되며 개인용 Ego 인격 패키지를 로드하는 행위를 엄격히 금지함.",
    "자연인 스튜어드의 재검토 서명 없이 최종 행정 취소 처분을 단독으로 확정하는 행위를 엄격히 금지함.",
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

## 4. 아키텍처 블루프린트 장별 안내

`coFay`의 설계 철학부터 교차 프로토콜 거버넌스 메커니즘까지 체계적으로 파악하려면 아래 6개 블루프린트 장을 순서대로 읽는 것을 권장합니다.

1. **[제1장: 개요와 존재론적 위상](./blueprint/01-개요와-존재론적-위상.md)** — `Fay = iFay + coFay` 이원 사회적 분업 구조와, 이관 가능한 자산형 공공 역할 화신 및 인격 확장형 개인 화신 사이의 근본적 경계를 심층적으로 다룹니다.
2. **[제2장: 자아 계층 없는 3계층 아키텍처와 역할 헌장](./blueprint/02-자아계층-없는-3계층-아키텍처와-역할헌장.md)** — `coFay`가 왜 자아 계층(Ego)을 의도적으로 제거하고, `RoleCharter` 1.0을 헌법 삼아 소셜 계층·상호작용 계층·인지 계층을 구동하는지 분석합니다.
3. **[제3장: 공공 역할 분류 체계와 적용 시나리오](./blueprint/03-공공역할-분류체계와-적용시나리오.md)** — `org_service`, `functional_post`, `project_collaborator` 3대 표준 아키타입의 권한 모델과 실무 도입 시나리오를 상세히 설명합니다.
4. **[제4장: 단일 계층 소유와 직교 위임 및 스튜어드 책임성](./blueprint/04-단일계층-소유와-직교위임-및-스튜어드-책임성.md)** — `FayID`, `Faying 1.1`, `SSP`, `CAP`, `GMChain` 5대 핵심 인프라를 관통하는 권한·책임 사슬과 재위임 금지 규율을 정리합니다.
5. **[제5장: 무상태 런타임, 연속 평판 및 이중 서명 소유권 이전](./blueprint/05-무상태-런타임-연속평판-및-이중서명-소유권이전.md)** — 다중 인스턴스 수평 오토스케일링이 단일 `MeritPocket` 연속 평판과 어떻게 양립하는지, 그리고 `TransferEnvelope` 1.0 이중 서명 원자적 소유권 이전과 전임 위임자 정리 메커니즘이 어떻게 동작하는지 해설합니다.
6. **[제6장: coFACTS 적합성 프레임워크와 로드맵](./blueprint/06-coFACTS-적합성-프레임워크와-로드맵.md)** — `coFACTS` 단계별 검증 체계, `iFACTS`와의 직교 경계 원칙 및 중장기 진화 로드맵을 제시합니다.
