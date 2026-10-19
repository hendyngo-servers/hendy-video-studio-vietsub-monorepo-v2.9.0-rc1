export async function translateImage(apiOrigin: string, token: string, file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const response = await fetch(`${apiOrigin}/api/ocr`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body });
  if (!response.ok) throw new Error(`OCR failed: ${response.status}`);
  const data = await response.json() as { text: string };
  return data.text;
}
