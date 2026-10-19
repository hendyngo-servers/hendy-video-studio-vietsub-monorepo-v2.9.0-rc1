// =============================================================================
// [PACKAGES/CORE-UTILS] HENDY STUDIO PRO - SHARED UTILITIES
// Used across apps/admin-web, apps/studio-web, and services/api-gateway
// =============================================================================

export function formatSrtTimestamp(seconds: number): string {
  const safeSec = Math.max(0, seconds);
  const hrs = Math.floor(safeSec / 3600);
  const mins = Math.floor((safeSec % 3600) / 60);
  const secs = Math.floor(safeSec % 60);
  const ms = Math.round((safeSec - Math.floor(safeSec)) * 1000);
  return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(
    secs
  ).padStart(2, "0")},${String(ms).padStart(3, "0")}`;
}

export function isIpv4InAllowedCidrList(
  ip: string,
  allowedCidrs: string[]
): boolean {
  const cleanIp = ip.trim();
  if (cleanIp === "127.0.0.1" || cleanIp === "::1") return true;
  return allowedCidrs.some((cidr) => {
    const [prefix] = cidr.split("/");
    const octets = prefix.split(".").slice(0, 2).join(".");
    return cleanIp.startsWith(octets);
  });
}
