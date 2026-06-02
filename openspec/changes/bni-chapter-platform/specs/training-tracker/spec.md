## ADDED Requirements

### Requirement: Training Course Catalog

The system SHALL maintain a catalog of 16 BNI training courses with: name, system form name, desktop form name, education credits, first-time fee, repeat fee, and provider.

#### Scenario: Officer views course catalog

- **WHEN** an officer opens the training management page
- **THEN** the system SHALL display all 16 courses with their credit values and fee information

---

### Requirement: Training Completion Records

Officers SHALL be able to record when a member completes a training course. The record SHALL include: member, course, completion date, and credits earned.

#### Scenario: Officer records training completion

- **WHEN** an officer records that member #003 completed "MSP培訓" on 2026-06-01
- **THEN** the system SHALL create a training record with 2 credits earned

---

### Requirement: Education Credit Calculation

The system SHALL automatically calculate each member's total education credits based on their completed training records. Credits SHALL be summed from all `training_records` entries.

#### Scenario: Member views credit summary

- **WHEN** a member opens their training dashboard
- **THEN** the system SHALL display total credits earned, completed courses list, and remaining required courses

##### Example: 會員學分彙總

- **GIVEN** member #003 有兩筆 training_records（2 分、3 分）
- **WHEN**開啟 `/dashboard/training`
- **THEN**總學分顯示 5，並列出兩筆已完成課程

---

### Requirement: Training Status Overview

Officers SHALL have access to a chapter-wide training status view showing each member's credit total and course completion status.

#### Scenario: Officer reviews chapter training status

- **WHEN** an officer opens the training overview page
- **THEN** the system SHALL display a table of all members with their credit totals, sortable by credits

##### Example: 幹部依學分排序

- **GIVEN** overview 表包含 36 位會員資料
- **WHEN** officer 點擊 credits 欄排序
- **THEN**表格以學分高到低排列，第一列為最高學分會員
