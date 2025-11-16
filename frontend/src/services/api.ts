const API_BASE = 'http://localhost:3000/api';

export async function getStreamUrl(): Promise<string> {
  const res = await fetch(`${API_BASE}/stream/url`);
  if (!res.ok) throw new Error('Failed to fetch stream URL');
  const data = await res.json();
  return data.url;
}

export async function getZoom(): Promise<number> {
  const res = await fetch(`${API_BASE}/camera/zoom`);
  if (!res.ok) throw new Error('Failed to fetch zoom');
  const data = await res.json();
  return data.zoom;
}

export async function setZoom(zoom: number): Promise<number> {
  const res = await fetch(`${API_BASE}/camera/zoom`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ zoom }),
  });
  if (!res.ok) throw new Error('Failed to set zoom');
  const data = await res.json();
  return data.zoom;
}

export async function getFocus(): Promise<number> {
  const res = await fetch(`${API_BASE}/camera/focus`);
  if (!res.ok) throw new Error('Failed to fetch focus');
  const data = await res.json();
  return data.focus;
}

export async function setFocus(focus: number): Promise<number> {
  const res = await fetch(`${API_BASE}/camera/focus`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ focus }),
  });
  if (!res.ok) throw new Error('Failed to set focus');
  const data = await res.json();
  return data.focus;
}

export async function getCameraInfo(): Promise<string> {
  const res = await fetch(`${API_BASE}/camera/info`);
  if (!res.ok) throw new Error('Failed to fetch camera info');
  const data = await res.json();
  return data.info;
}

export async function setAutofocus(enable: boolean): Promise<boolean> {
  const res = await fetch(`${API_BASE}/camera/autofocus`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ enable }),
  });
  if (!res.ok) throw new Error('Failed to set autofocus');
  const data = await res.json();
  return data.enable;
}

export async function setStabilization(enable: boolean): Promise<boolean> {
  const res = await fetch(`${API_BASE}/camera/stabilization`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ enable }),
  });
  if (!res.ok) throw new Error('Failed to set stabilization');
  const data = await res.json();
  return data.enable;
}
