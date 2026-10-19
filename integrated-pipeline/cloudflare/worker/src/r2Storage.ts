export interface StorageEnv {
  PIPELINE_LOGS?: R2Bucket;
}

export async function putPipelineLog(env: StorageEnv, key: string, value: unknown): Promise<void> {
  if (!env.PIPELINE_LOGS) return;
  await env.PIPELINE_LOGS.put(key, JSON.stringify(value), { httpMetadata: { contentType: "application/json" } });
}

export async function getPipelineLog(env: StorageEnv, key: string): Promise<string | null> {
  return env.PIPELINE_LOGS ? (await env.PIPELINE_LOGS.get(key))?.text() ?? null : null;
}
