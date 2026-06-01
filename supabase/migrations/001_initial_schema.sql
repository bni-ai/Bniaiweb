-- BNI 華AI分會 管理平台 初始 Schema
-- Migration 001: Full schema including member profiles, presentations, and slide data

-- ─────────────────────────────────────────────
-- MEMBERS
-- ─────────────────────────────────────────────
CREATE TABLE members (
  id                        uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  email                     text    NOT NULL UNIQUE,
  member_number             text,                         -- e.g. "027"
  chinese_name              text    NOT NULL,
  english_name              text,
  line_name                 text,

  -- 職稱 & 專業
  specialty_title           text,                         -- 一行職稱，顯示在投影片
  specialty_description     text,                         -- 詳細說明

  -- 三層引薦目標
  general_referral          text,                         -- 一般引薦
  ideal_referral            text,                         -- 理想引薦
  dream_referral            text,                         -- 夢想引薦

  -- 公司資訊（一對一表單 Page 1）
  company_name              text,
  company_address           text,
  industry_experience_years int,
  previous_career           text,

  -- GAINS 收穫工作表（一對一表單 Page 2）
  gains_goals               text,                         -- 目標 Goals
  gains_accomplishments     text,                         -- 成就 Accomplishments
  gains_interests           text,                         -- 興趣/愛好 Interests
  gains_networks            text,                         -- 人脈 Networks
  gains_skills              text,                         -- 技能 Skills

  -- 照片
  photo_url                 text,

  -- 角色 & 職掌（分離，參照 HANDOFF.md D-roles）
  role                      text    NOT NULL DEFAULT 'member'
                              CHECK (role IN ('member', 'officer', 'president')),
  position                  text    DEFAULT NULL
                              CHECK (position IN (
                                '主席','副主席','秘書財務','資訊組長',
                                '成長協調','活動協調','導師協調','教育協調','來賓接待'
                              )),
  committee                 text    DEFAULT NULL
                              CHECK (committee IN (
                                '導師群','接待組員','教育組員','秘財組員',
                                '資訊組員','成長組員','活動組員','會員委員'
                              )),

  created_at                timestamptz DEFAULT now(),
  updated_at                timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────────
-- 前十名客戶表（一對一表單 Page 3）
-- ─────────────────────────────────────────────
CREATE TABLE member_top_clients (
  id          uuid  DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id   uuid  NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  rank        int   NOT NULL CHECK (rank BETWEEN 1 AND 10),
  industry    text  NOT NULL,          -- 行業類別
  company_type text,                   -- 公司規模/類型
  location    text,                    -- 地區
  notes       text,
  updated_at  timestamptz DEFAULT now(),
  UNIQUE (member_id, rank)
);

-- ─────────────────────────────────────────────
-- 業務人脈圈規劃表（一對一表單 Page 4）
-- ─────────────────────────────────────────────
CREATE TABLE member_contacts_circle (
  id            uuid  DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id     uuid  NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  tier          int   NOT NULL CHECK (tier IN (1, 2, 3)),
                -- 1 = 核心圈（密切往來）
                -- 2 = 中層圈（定期聯繫）
                -- 3 = 外圍圈（潛在關係）
  name          text  NOT NULL,
  relationship  text,                  -- 關係描述
  industry      text,
  notes         text,
  created_at    timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────────
-- WEEKLY BRIEFS（每週簡報 → 會員投影片資料來源）
-- ─────────────────────────────────────────────
CREATE TABLE weekly_briefs (
  id            uuid  DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id     uuid  NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  week_date     date  NOT NULL,
  have_this_week text,                 -- 本週可提供
  want_this_week text,                 -- 本週需求
  status        text  NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft', 'submitted')),
  submitted_at  timestamptz,
  UNIQUE (member_id, week_date)
);

-- ─────────────────────────────────────────────
-- KEYNOTE TALKS（短講 → 短講投影片資料來源）
-- ─────────────────────────────────────────────
CREATE TABLE keynote_talks (
  id              uuid  DEFAULT gen_random_uuid() PRIMARY KEY,
  speaker_id      uuid  NOT NULL REFERENCES members(id),
  week_date       date  NOT NULL,
  topic           text  NOT NULL,
  outline         text,
  product_images  jsonb DEFAULT '[]',  -- [{ url, caption }]
  status          text  NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft', 'submitted')),
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────────
-- GUESTS（來賓 → 來賓投影片資料來源）
-- ─────────────────────────────────────────────
CREATE TABLE guests (
  id            uuid  DEFAULT gen_random_uuid() PRIMARY KEY,
  name          text  NOT NULL,
  specialty     text,
  referrer_id   uuid  REFERENCES members(id),
  week_date     date  NOT NULL,
  self_intro    text,
  feedback      text,
  created_at    timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────────
-- WEEKLY AWARDS（獎項投影片資料來源）
-- ─────────────────────────────────────────────
CREATE TABLE weekly_awards (
  id            uuid  DEFAULT gen_random_uuid() PRIMARY KEY,
  week_date     date  NOT NULL,
  recipient_id  uuid  REFERENCES members(id),
  award_type    text  NOT NULL
                  CHECK (award_type IN (
                    'top_referrer',    -- 最多引薦
                    'visitor_award',   -- 來賓獎
                    'bni_bucks',       -- BNI Bucks
                    'spotlight',       -- 本週焦點
                    'other'
                  )),
  description   text,
  created_by    uuid  REFERENCES members(id),
  created_at    timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────────
-- WEEKLY VP REPORTS（VP 報告投影片資料來源）
-- ─────────────────────────────────────────────
CREATE TABLE weekly_vp_reports (
  id                  uuid  DEFAULT gen_random_uuid() PRIMARY KEY,
  week_date           date  NOT NULL UNIQUE,
  total_referrals     int   DEFAULT 0,
  total_one_on_ones   int   DEFAULT 0,
  total_visitors      int   DEFAULT 0,
  member_attendance   int   DEFAULT 0,
  referral_value_twd  int   DEFAULT 0,   -- 引薦總價值（新台幣）
  notes               text,
  created_by          uuid  REFERENCES members(id),
  updated_at          timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────────
-- PRESENTATIONS
-- slide_order JSONB shape:
--   [{ type: SlideType, id: uuid, visible: boolean }]
--
-- SlideType values:
--   'cover'      → auto-generated, no id needed
--   'member'     → id = weekly_briefs.id
--   'keynote'    → id = keynote_talks.id
--   'guest'      → id = guests.id
--   'award'      → id = week_date (string), renders weekly_awards for that week
--   'vp_report'  → id = weekly_vp_reports.id
--   'team'       → auto-generated from members table
-- ─────────────────────────────────────────────
CREATE TABLE presentations (
  id            uuid  DEFAULT gen_random_uuid() PRIMARY KEY,
  week_date     date  NOT NULL UNIQUE,
  title         text,
  status        text  NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft', 'published')),
  published_url text,
  slide_order   jsonb NOT NULL DEFAULT '[]',
  created_by    uuid  REFERENCES members(id),
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────────
-- ONE-ON-ONES
-- ─────────────────────────────────────────────
CREATE TABLE member_availability (
  id          uuid  DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id   uuid  NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  day_of_week int   NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=週日
  start_time  time  NOT NULL,
  end_time    time  NOT NULL
);

CREATE TABLE one_on_ones (
  id            uuid  DEFAULT gen_random_uuid() PRIMARY KEY,
  inviter_id    uuid  NOT NULL REFERENCES members(id),
  invitee_id    uuid  NOT NULL REFERENCES members(id),
  scheduled_at  timestamptz,
  status        text  NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes         text,
  jitsi_room    text,               -- 自動生成的 Jitsi room 名稱
  created_at    timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────────
-- EVENTS & TRAINING
-- ─────────────────────────────────────────────
CREATE TABLE events (
  id                    uuid  DEFAULT gen_random_uuid() PRIMARY KEY,
  title                 text  NOT NULL,
  date                  date  NOT NULL,
  description           text,
  registration_deadline date,
  max_participants      int,
  created_at            timestamptz DEFAULT now()
);

CREATE TABLE event_registrations (
  id          uuid  DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id    uuid  NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  member_id   uuid  NOT NULL REFERENCES members(id),
  status      text  NOT NULL DEFAULT 'registered'
                CHECK (status IN ('registered', 'cancelled')),
  created_at  timestamptz DEFAULT now(),
  UNIQUE (event_id, member_id)
);

CREATE TABLE training_courses (
  id                uuid  DEFAULT gen_random_uuid() PRIMARY KEY,
  name              text  NOT NULL,
  system_form_name  text,
  desktop_form_name text,
  credits           int   DEFAULT 0,
  first_fee         int   DEFAULT 0,   -- 新台幣
  repeat_fee        int   DEFAULT 0,
  provider          text
);

CREATE TABLE training_records (
  id              uuid  DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id       uuid  NOT NULL REFERENCES members(id),
  course_id       uuid  NOT NULL REFERENCES training_courses(id),
  completed_at    date  NOT NULL,
  credits_earned  int   DEFAULT 0
);

-- ─────────────────────────────────────────────
-- AI SETTINGS
-- ─────────────────────────────────────────────
CREATE TABLE ai_settings (
  id                uuid  DEFAULT gen_random_uuid() PRIMARY KEY,
  provider          text  NOT NULL CHECK (provider IN ('claude', 'gemini', 'openai')),
  api_key_encrypted text,
  model_name        text,
  is_active         boolean DEFAULT false
);

-- ─────────────────────────────────────────────
-- UPDATED_AT TRIGGER
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER keynote_talks_updated_at
  BEFORE UPDATE ON keynote_talks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER presentations_updated_at
  BEFORE UPDATE ON presentations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
