import { onRequest as proxyRequest } from "./api/[[path]].js";

export async function onRequest(context) {
  const requestUrl = new URL(context.request.url);
  const rewritten = new Request(new URL("/health", requestUrl), context.request);
  return proxyRequest({ ...context, request: rewritten });
}
