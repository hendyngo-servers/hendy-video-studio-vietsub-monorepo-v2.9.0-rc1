import type { RequestHandler } from 'express';

export declare function verifyCloudflareAccessJwt(
  token: string,
  env?: Record<string, string | undefined>,
  nowSeconds?: number,
): Promise<Record<string, unknown> | null>;

export declare function createRequireCloudflareAccessAdmin(options?: {
  env?: Record<string, string | undefined>;
  verifyJwt?: (token: string, env: Record<string, string | undefined>) => Promise<Record<string, unknown> | null>;
}): RequestHandler;

export declare const requireCloudflareAccessAdmin: RequestHandler;
