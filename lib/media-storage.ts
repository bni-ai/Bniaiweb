const MEDIA_BUCKET = "bniai-media";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png"]);

type BucketClient = {
  storage: {
    listBuckets: () => Promise<{ data: Array<{ id: string; name: string }> | null; error: { message?: string } | null }>;
    createBucket: (
      id: string,
      options?: { public: boolean; fileSizeLimit?: string | number | null; allowedMimeTypes?: string[] | null; type?: string },
    ) => Promise<{ error: { message?: string } | null }>;
    from: (bucket: string) => {
      upload: (
        path: string,
        body: Buffer,
        options?: { contentType?: string; upsert?: boolean },
      ) => Promise<{ error: { message?: string } | null }>;
      getPublicUrl: (path: string) => { data: { publicUrl: string } };
    };
  };
};

function sanitizeFileName(name: string) {
  const cleaned = name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/-+/g, "-");
  return cleaned.replace(/^-|-$/g, "") || "upload";
}

function extensionFromFile(file: File) {
  if (file.type === "image/jpeg") return ".jpg";
  if (file.type === "image/png") return ".png";
  const match = file.name.match(/\.[a-z0-9]+$/i);
  return match ? match[0].toLowerCase() : "";
}

export function assertImageFile(file: File, label: string) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error(`${label} 只接受 JPG 或 PNG`);
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("檔案大小不可超過 5MB");
  }
}

export async function ensureMediaBucket(supabase: BucketClient) {
  const { data, error } = await supabase.storage.listBuckets();
  if (error) throw error;
  if (!data?.some((bucket) => bucket.id === MEDIA_BUCKET || bucket.name === MEDIA_BUCKET)) {
    const { error: createError } = await supabase.storage.createBucket(MEDIA_BUCKET, { public: true });
    if (createError && !String(createError.message || "").includes("already exists")) {
      throw createError;
    }
  }
}

export async function uploadImageFile(supabase: BucketClient, file: File, storagePath: string) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(storagePath, buffer, {
    contentType: file.type,
    upsert: true,
  });
  if (error) throw error;
  return supabase.storage.from(MEDIA_BUCKET).getPublicUrl(storagePath).data.publicUrl;
}

export function buildMemberPhotoPath(memberId: string, file: File) {
  return `members/${memberId}/photo${extensionFromFile(file) || ".jpg"}`;
}

export function buildMemberProductPath(memberId: string, file: File) {
  return `members/${memberId}/products/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;
}

export function buildKeynoteProductPath(talkId: string, file: File) {
  return `keynotes/${talkId}/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;
}

export { MEDIA_BUCKET };
