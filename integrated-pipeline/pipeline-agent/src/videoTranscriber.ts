export async function transcribeVideo(apiOrigin: string, token: string, file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const response = await fetch(`${apiOrigin}/api/transcribe`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body });
  if (!response.ok) throw new Error(`Transcription failed: ${response.status}`);
  const data = await response.json() as { text: string };
  return data.text;
}
