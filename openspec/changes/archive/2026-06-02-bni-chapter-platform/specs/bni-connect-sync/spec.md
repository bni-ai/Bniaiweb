## ADDED Requirements

### Requirement: BNI Connect Credential Storage

The system SHALL allow an admin with position='主席' to store BNI Connect Global login credentials (username + password) in the `admin_settings` table. The password SHALL be encrypted with AES-256 before storage and SHALL never be returned in plaintext via any API response.

#### Scenario: Storing credentials

- **WHEN** the 主席 saves BNI Connect credentials on the settings page
- **THEN** the system SHALL encrypt the password, store both values in admin_settings, and display the username with the password as `****` in the UI

#### Scenario: Unauthorized access

- **WHEN** a user whose role is not 'admin' or whose position is not '主席' attempts to read or write admin_settings
- **THEN** Supabase RLS SHALL reject the request with a permission error

##### Example: member 嘗試讀取帳密

- **GIVEN** user role=`member`, position=`無`
- **WHEN**呼叫 `/api/admin/settings/bni-connect` 嘗試讀取帳號密碼
- **THEN** API 回傳 403，且不返回任何明文或遮罩前的密碼內容

---

### Requirement: Playwright Auto-Fill Job

The system SHALL provide a `lib/bni-connect-sync/playwright-job.ts` server-only module that accepts weekly brief data and uses Playwright headless Chromium to log in to bniconnectglobal.com and submit the same referral/transaction/guest figures.

#### Scenario: Successful auto-fill

- **WHEN** the Playwright job is invoked with valid credentials and brief data
- **THEN** the job SHALL log in, navigate to the submission form, fill all required fields, submit, and return `{ success: true }`
- **AND** the corresponding sync_logs record SHALL be updated to `status='success'` with a `synced_at` timestamp

#### Scenario: Login failure

- **WHEN** the Playwright job receives incorrect credentials
- **THEN** the job SHALL detect the login error, abort without submitting, and return `{ success: false, errorMessage: 'Login failed: invalid credentials' }`
- **AND** the sync_logs record SHALL be updated to `status='failed'` with the error message

#### Scenario: Navigation timeout

- **WHEN** bniconnectglobal.com does not respond within 30 seconds
- **THEN** the Playwright job SHALL timeout, close the browser, and return `{ success: false, errorMessage: 'Timeout after 30s' }`

---

### Requirement: Manual Sync Trigger

The system SHALL provide a `/admin/bni-connect` management page where an admin can manually trigger BNI Connect sync for a specific weekly brief.

#### Scenario: Manual trigger

- **WHEN** an admin clicks [立即同步] on the BNI Connect management page
- **THEN** the system SHALL call `/api/bni-connect/trigger` POST, show a loading state, and on completion display a success or failure status badge
- **AND** the sync_logs table SHALL contain a new record with `trigger_type='manual'`, `triggered_by` set to the admin's member id, and the final status

#### Scenario: Viewing sync history

- **WHEN** an admin loads the `/admin/bni-connect` page
- **THEN** the page SHALL display the 10 most recent sync_logs entries with: week_date, status badge (pending=yellow, success=green, failed=red), synced_at time, and triggered_by name
