## ADDED Requirements

### Requirement: Multi-Provider AI Support

The system SHALL support three AI providers: Claude (Anthropic), Gemini (Google), and OpenAI. Each provider SHALL be configurable via the `ai_settings` table with: provider name, encrypted API key, model name, and active status.

#### Scenario: System uses configured provider

- **WHEN** an AI request is made and Claude is the active provider
- **THEN** the system SHALL route the request to the Claude API using the configured model and API key

##### Example: active provider = claude

- **GIVEN** `ai_settings.is_active=true` 且 `provider='claude'`
- **WHEN** member 發送「誰的專業是 AI落地」
- **THEN** request 發送至 Claude adapter，不呼叫 Gemini/OpenAI adapter

#### Scenario: Active provider fails with fallback

- **WHEN** the active provider returns an error and another provider is enabled
- **THEN** the system SHALL retry with the next enabled provider and log the fallback event

##### Example: claude 失敗 fallback 到 gemini

- **GIVEN** active provider=Claude，備援 provider=Gemini
- **WHEN** Claude 回傳 500
- **THEN**系統在同次請求改呼叫 Gemini 並寫入 fallback log

---

### Requirement: Provider Switching

Officers SHALL be able to switch the active AI provider via the admin settings page. Switching SHALL take effect immediately without requiring redeployment.

#### Scenario: Officer switches provider

- **WHEN** an officer changes the active provider from Claude to Gemini in admin settings
- **THEN** all subsequent AI requests SHALL use the Gemini API

##### Example: 切換後立即生效

- **GIVEN** 10:00 切換 active provider 為 Gemini
- **WHEN** 10:01 送出下一筆 AI 查詢
- **THEN**該查詢使用 Gemini adapter 且不需重新部署

---

### Requirement: Natural Language Member Query

The AI assistant SHALL answer natural-language questions about member data. The system SHALL provide member profiles as context to the AI model. Queries SHALL support Chinese (Traditional) input.

#### Scenario: User asks about member expertise

- **WHEN** a user asks "誰的專業是 AI落地"
- **THEN** the AI SHALL return a list of members whose specialty matches, with names and brief descriptions

---

### Requirement: Automated Submission Reminders

The AI assistant SHALL generate personalized reminder messages for members who have not submitted their weekly brief by a configurable reminder time (default: Thursday 18:00).

#### Scenario: System generates reminders

- **WHEN** the reminder time arrives and 7 members have not submitted
- **THEN** the system SHALL generate 7 personalized reminder messages ready for officer review and dispatch
