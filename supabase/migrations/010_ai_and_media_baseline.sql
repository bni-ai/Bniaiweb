CREATE TABLE IF NOT EXISTS member_product_images (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  public_url text NOT NULL,
  caption text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS member_product_images_member_path_idx
  ON member_product_images(member_id, storage_path);

CREATE TABLE IF NOT EXISTS ai_conversations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  chapter_id uuid NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  member_id uuid REFERENCES members(id) ON DELETE SET NULL,
  provider text NOT NULL CHECK (provider IN ('claude', 'gemini', 'openai')),
  query text NOT NULL,
  response text NOT NULL,
  intent text NOT NULL,
  fallback_used boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);
