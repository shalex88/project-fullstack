<!--
Sync Impact Report
- Version change: n/a → 1.0.0
- Modified principles: (template placeholders) → Code Quality Assurance; Testing Standards; User Experience Consistency; Performance Requirements
- Added sections: Quality Gates & Standards; Development Workflow & Review
- Removed sections: Placeholder Principle 5
- Templates requiring updates:
	- ✅ Updated: .specify/templates/plan-template.md (Constitution Check gates)
	- ✅ Updated: .specify/templates/tasks-template.md (tests now required)
	- ✅ Reviewed: .specify/templates/spec-template.md (no change needed)
- Follow-up TODOs: None
-->

# Project Fullstack Constitution

## Core Principles

### I. Code Quality Assurance (NON-NEGOTIABLE)

All changes MUST meet enforceable quality standards before merge:

- MUST pass formatting and linting with project-standard tooling and zero blockers.
- MUST include meaningful names, small cohesive functions, and avoid dead code.
- MUST include security and correctness checks appropriate to the change scope.
- MUST undergo peer review focused on readability, maintainability, and risk.
- SHOULD prefer simpler designs over premature abstractions; justify complexity explicitly.

Rationale: High code quality reduces defects, accelerates onboarding, and lowers total cost of ownership.

### II. Testing Standards

Testing is mandatory and proportionate to risk:

- Unit tests MUST cover core logic; target ≥ 80% line coverage overall; critical paths MUST be explicitly tested (quality over raw percentage).
- Integration/contract tests MUST be added when crossing process/service boundaries or modifying external interfaces, schemas, or protocols.
- Tests MUST be deterministic and run in CI; flaky tests MUST be fixed or quarantined within 48h with an issue link and owner.
- Red-Green-Refactor is encouraged; tests MAY precede implementation for risky changes.

Rationale: Reliable tests enable safe refactoring, predictable releases, and faster iteration.

### III. User Experience Consistency

User-facing changes MUST align with a consistent experience:

- MUST follow established design tokens, components, and interaction patterns (if present); absent a system, define and document chosen patterns in the feature spec.
- MUST include accessibility basics: keyboard operability, color contrast, focus states, and clear error messaging; aim for WCAG 2.1 AA where applicable.
- MUST provide acceptance criteria demonstrating UX flows and edge cases.
- SHOULD maintain consistent terminology, empty states, and loading/error behaviors.

Rationale: Consistency improves usability, reduces cognitive load, and eases support.

### IV. Performance Requirements

Each feature MUST declare and meet performance expectations or explicitly justify exceptions:

- Define budgets per context (examples):
  - Backend request/response: p95 < 300ms, p99 < 1s under expected load.
  - CLI tools: typical command completes < 2s locally; provide progress for longer.
  - Streaming/real-time features: document latency/throughput targets and buffer strategy.
- Add benchmarks or load tests for critical paths; track regressions with thresholds.
- Instrument key operations with metrics and logs sufficient for diagnosis.

Rationale: Performance is a product feature; clear budgets prevent silent regressions.

## Quality Gates & Standards

Definition of Done for any PR includes these gates:

- Code Quality: formatting + linting pass; review checklist completed; no critical static analysis findings.
- Testing: appropriate unit/integration/contract tests added; CI green; coverage report attached for substantial changes.
- UX Consistency: user-flow acceptance criteria satisfied; accessibility basics verified; screenshots or recordings for UI changes.
- Performance: stated budgets present; benchmarks/load tests added when relevant; no budget regressions in CI.

## Development Workflow & Review

- Every PR MUST link to its spec/plan section stating requirements, tests, and performance budgets.
- Reviewers MUST verify constitution gates; exceptions require a time-bound waiver documented in the PR with an owner.
- Contract or cross-service changes MUST include integration/contract tests and migration notes.
- CI is the source of truth; merges require green checks and completed review.

## Governance

- This constitution supersedes informal practices. Conflicts resolve in favor of this document.
- Amendments: propose via PR modifying this file with rationale, impact, and migration plan; require at least two approvals or designated owner approval.
- Versioning policy: semantic versioning
	- MAJOR: incompatible governance/principle removals or redefinitions.
	- MINOR: new principles/sections or materially expanded guidance.
	- PATCH: clarifications, wording, non-semantic refinements.
- Compliance: PR reviews enforce gates. Waivers expire within one release unless renewed with plan to close.
- Review cadence: quarterly review to assess effectiveness and update budgets/tooling.

**Version**: 1.0.0 | **Ratified**: 2025-11-16 | **Last Amended**: 2025-11-16
