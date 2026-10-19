export interface SoftwareAppDTO {
  id: string;
  name: string;
  slug: string;
  category: string;
  description?: string;
}

export interface DownloadTokenDTO {
  token: string;
  expiresAt: number;
}
