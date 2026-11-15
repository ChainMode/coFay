# 06. coFACTS 적합성 프레임워크와 로드맵

## 6.1 `iFACTS`와 `coFACTS`의 직교 경계를 명확히 그어야 하는 이유

개방형 프로토콜 생태계가 파편화와 규격 미달 모조품의 난립을 막으려면, 특정 구현체가 실제로 프로토콜 규범을 준수하는지 객관적이고 재현 가능한 자동화 테스트로 입증할 수 있어야 합니다. 상위 우산 저장소 `ifay`는 이미 개인 디지털 화신을 위해 **iFACTS(iFay Architecture Conformance Test Suite)**와 `iFay Ready` 단계별 인증 체계를 확립해 두었습니다(`ifay` 참조). 그렇다면 왜 `coFay`를 기존 `iFACTS` 안에 그대로 편입시켜 동일한 판정 기준을 공유하지 않고 별도의 검증 프레임워크로 분리했을까요?

그 해답은 **두 종(Species)이 지켜야 할 핵심 보안 불변식이 정반대 방향을 가리킨다**는 데 있습니다.
- `iFACTS`에서 적격 판정을 받으려면 개인 화신 구현체가 **인간 프라임(Human Prime)** 고유의 개인용 `Ego` 모델을 정확히 로드해 가치관을 정렬하는지, 그리고 인간 프라임 전용 페어링 핸드셰이크와 후견인 전환 절차를 올바르게 수행하는지 입증해야 합니다.
- 반면 `coFay`에서는 어떠한 개인용 `Ego` 모델이라도 탑재하는 순간 곧바로 **최고 심각도의 보안 위반(`COFAY_EGO_FORBIDDEN`)**이 됩니다. 반대로 `coFay`가 반드시 검증받아야 하는 조직 소속 자연인 스튜어드(`steward_human_id`) 관통 책임성, 단일 계층 소유 중첩 차단, 이중 서명 소유권 이전 시 전임 운영 위임 관리자 강제 초기화 같은 핵심 규율은 개인용 `iFay`에는 애초에 존재하지 않는 개념입니다.

따라서 생태계는 양방향 직교 경계 차단 규율을 엄격히 집행합니다.
1. **`@ifay/ifacts`는 오직 개인용 `iFay` 및 호스트 호환 제품만 검증**하며, `cofay_` 대상을 만나면 명시적으로 실행을 거부하고 `coFACTS`로 안내합니다(`ifay` 참조).
2. **`coFACTS`(Common Fay Architecture Conformance Test Suite)는 오직 `coFay` 역할 구현체, 역할 헌장 및 거버넌스 상태 전이 검증만 전담**합니다. `runCoFactsL1Check` 실행 시 입력 객체에서 `ifay_` 식별자나 `IFAY_MANIFEST` 아티팩트 유형이 감지되면 즉시 `conformance: "REJECTED_BOUNDARY"` 결과와 함께 오류 코드 `BOUNDARY_IFAY_USE_IFACTS`를 반환합니다.

---

## 6.2 `coFACTS` 3단계 점진적 적합성 모델

생태계 전반의 테스트 엔지니어링 방법론에 발맞추어, `coFACTS`는 하위 단계를 완벽히 통과하기 전에는 상위 단계 적합성을 주장할 수 없는(No-skip) 엄격한 3단계 누적 모델을 채택합니다.

| 단계 | 명칭 | 검증 대상 및 핵심 검증 항목 | 현재 상태 |
|------|------|------------------------|----------|
| **L1** | **헌장 및 상태 머신 적합성 (Charter & State Conformance)** | `RoleCharter` 1.0 JSON Schema 오프라인 결정론적 검증, 자아 계층 탑재 금지 레드라인, 3대 공공 역할 아키타입 열거 검증, 단일 계층 소유 및 자연인 스튜어드 의무 바인딩, SSP 비공개 스킬 호출자 인증 게이트, RFC 8785 JCS + Ed25519 서명 무결성, 단일 홉 `iFay` 위임 및 재위임 차단, `TransferEnvelope` 1.0 이중 서명 원자적 소유권 이전 및 리플레이 방지 벡터 검증 | **v1.0 배포 완료** (본 저장소 `@ifay/cofay` 내장) |
| **L2** | **교차 프로토콜 인터페이스 적합성 (Cross-Protocol Interface Conformance)** | 라이브 구동 중인 `coFay` 엔드포인트 대상 프로토콜 상호작용 검증: SSP `/.well-known/skill-sharing` JWS 기술자 및 제한 등급 엔드포인트 양방향 인증 검증, `Faying 1.1` 위임 책임 체인 자격증명 검증, CAP `cap_bounds` 초과 명령 차단 검증, ICP / TP 세션 내 공공 역할 신원 고지 검증 | **Phase 2 계획** |
| **L3** | **다중 인스턴스 탄력성 및 감사 연속성 (Elasticity & Audit Continuity)** | 엔드투엔드 카오스 및 거버넌스 훈련: 다중 무상태 FayGer 워커 동시 응답 일관성 검증, 로컬 해시 체인 감사 3원 튜플 `(cofay_id, owner_id, actor_signer_id)` 위변조 방지 무결성 검증, 스튜어드 유고 시 `SUSPENDED_PENDING_SUCCESSION` 보전 동결 전환 검증, **Global Merit Chain(GMChain, 공예체인)** `MeritPocket` 연속 기록 대사 검증 | **Phase 3 계획** |

---

## 6.3 `coFACTS` L1 6대 자동화 검사 항목과 기계 판독형 리포트

이 저장소의 `src/cofay-charter.mjs`에서 내보내는 `runCoFactsL1Check(subject)` 함수는 외부 런타임 의존성 없는 표준 L1 검사기를 구현하며, 언제나 `report_version: "cofacts-l1-report/1.0"` 형식의 정형화된 리포트 객체를 출력합니다.

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

함께 배포되는 공식 테스트 벡터 번들 `vectors/cofay-role-charter-vectors.json`에는 총 **20개의 정방향·역방향 표준 벡터**(`V01`–`V20`)가 수록되어 있습니다. 서드파티 개발팀이 Rust, Go, Python, TypeScript 등 어떤 언어로 자체 `coFay` 런타임이나 거버넌스 게이트웨이를 구현하든, 이 벡터 세트의 모든 정상 케이스 통과와 비정상 케이스별 정확한 오류 코드 차단을 100% 재현해야만 `coFACTS` L1 적합성을 공식 선언할 수 있습니다.

---

## 6.4 단계별 진화 로드맵(Phased Roadmap)

`coFay` 프로젝트는 '제도적 헌장 계약과 암호학적 경계를 먼저 단단히 세운 뒤, 실시간 교차 프로토콜 통합으로 확장하고, 최종적으로 대규모 공공 역할 거버넌스 네트워크를 완성한다'는 4단계 진화 경로를 따릅니다.

### 제1단계: 0→1 규격 확립 및 `coFACTS` L1 베이스라인 (현재 배포 완료 · `2025-10-25` 초판 기준선)
- 자아 계층을 배제한 3계층 공공 역할 존재론과 1차 3대 표준 역할 아키타입(`org_service`, `functional_post`, `project_collaborator`) 확립
- `RoleCharter` 1.0 및 이중 서명 원자적 소유권 이전 `TransferEnvelope` 1.0 표준 JSON Schema 동결(`schemas/cofay-role-charter-1.0.json` 및 `schema/2025-10-25/` 3종 미러 아티팩트 포함)
- 20개 Ed25519 + RFC 8785 JCS 공식 적합성 테스트 벡터 및 무의존성 `@ifay/cofay` 레퍼런스 검증 라이브러리 배포
- 9개 언어 권위 아키텍처 블루프린트 및 빠른 시작 가이드 전량 구축 완료

### 제2단계: 교차 프로토콜 라이브 엔드포인트 연동 및 `coFACTS` L2 (단기 진화)
- `Faying 1.1`(`coFay` Delegated Stewardship Profile), `SSP 1.0` 서버 런타임 및 `FayGer` 정적 인덱스 레지스트리와의 엔드투엔드 실시간 핸드셰이크 연동 검증
- HTTP/TLS 라이브 프로빙을 지원하는 `coFACTS` L2 자동화 러너를 배포하여 원격 `coFay` 엔드포인트가 노출하는 `RoleCharter` 서명 배서와 제한 등급 스킬의 호출자 인증 강제력을 자동 점검

### 제3단계: 임계치 키 수탁, 다중 인스턴스 탄력성 및 `coFACTS` L3 (중기 진화)
- `FayID`의 N-of-M 조직 임계치 다중 서명(Threshold Multi-sig) 정책과 연동하여 대형 공공 기관의 위원회 연서 기반 헌장 개정 및 스튜어드 유고 시 긴급 승계 훈련 지원
- **FayGer** 컨테이너 오케스트레이션용 무상태 `coFay` 워커 템플릿과 위변조 방지 분산 해시 체인 감사 수집기를 제공하고 `coFACTS` L3 인증 체계 가동

### 제4단계: 공예체인(GMChain) 기반 공공 서비스 생태계 확산 (장기 비전)
- 산업 간 `coFay` 공공 역할 디렉터리 탐색과 `MeritPocket` 투명 공신력 검증을 보편화하여, 시정 민원 창구·학술 동료 심사 위원석·오픈소스 핵심 인프라 협업 유닛이 비화폐적(non-monetary) **평판치(MeriToken)**의 동기와 규율 아래 높은 신뢰성과 명확한 책임성, 독점 없는 인간-AI 협업 공공 사회 네트워크를 구축하도록 뒷받침
