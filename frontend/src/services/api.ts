const BACKEND_IP = import.meta.env.BACKEND_IP || 'localhost';
const API_BASE = `http://${BACKEND_IP}:3000/api/v1`;
const CAMERA_ID = 1; // Assuming a single camera setup for simplicity

export async function isServerReachable(): Promise<boolean> {
  try {
    // Any HTTP response means the server is reachable; network errors mean it's not
    await fetch(API_BASE, { method: 'HEAD' });
    return true;
  } catch {
    return false;
  }
}

export async function getStreamUrl(): Promise<string> {
  const res = await fetch(`${API_BASE}/stream/${CAMERA_ID}/url`);
  if (!res.ok) throw new Error('Failed to fetch stream URL');
  const data = await res.json();
  return data.url;
}

export async function getZoom(): Promise<number> {
  const res = await fetch(`${API_BASE}/cameras/${CAMERA_ID}/zoom`);
  if (!res.ok) throw new Error('Failed to fetch zoom');
  const data = await res.json();
  return data.zoom;
}

export async function setZoom(zoom: number): Promise<number> {
  const res = await fetch(`${API_BASE}/cameras/${CAMERA_ID}/zoom`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ zoom }),
  });
  if (!res.ok) throw new Error('Failed to set zoom');
  const data = await res.json();
  return data.zoom;
}

export async function getFocus(): Promise<number> {
  const res = await fetch(`${API_BASE}/cameras/${CAMERA_ID}/focus`);
  if (!res.ok) throw new Error('Failed to fetch focus');
  const data = await res.json();
  return data.focus;
}

export async function setFocus(focus: number): Promise<number> {
  const res = await fetch(`${API_BASE}/cameras/${CAMERA_ID}/focus`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ focus }),
  });
  if (!res.ok) throw new Error('Failed to set focus');
  const data = await res.json();
  return data.focus;
}

export async function getCameraInfo(): Promise<string> {
  const res = await fetch(`${API_BASE}/cameras/${CAMERA_ID}/info`);
  if (!res.ok) throw new Error('Failed to fetch camera info');
  const data = await res.json();
  return data.info;
}

export async function setAutofocus(enable: boolean): Promise<boolean> {
  const res = await fetch(`${API_BASE}/cameras/${CAMERA_ID}/autofocus`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ enable }),
  });
  if (!res.ok) throw new Error('Failed to set autofocus');
  const data = await res.json();
  return data.enable;
}

export async function setStabilization(enable: boolean): Promise<boolean> {
  const res = await fetch(`${API_BASE}/video/${CAMERA_ID}/stabilization`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ enable }),
  });
  if (!res.ok) throw new Error('Failed to set stabilization');
  const data = await res.json();
  return data.enable;
}

export interface CameraCapabilities {
  zoom: boolean;
  focus: boolean;
  autofocus: boolean;
  stabilization: boolean;
}

export async function detectCameraCapabilities(): Promise<CameraCapabilities> {
  const capabilities: CameraCapabilities = {
    zoom: true,
    focus: true,
    autofocus: true,
    stabilization: true,
  };

  // Test stabilization by trying to set it
  try {
    const res = await fetch(`${API_BASE}/cameras/${CAMERA_ID}/stabilization`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ enable: false }),
    });
    // 500 or 501 means not supported/implemented
    if (res.status === 500 || res.status === 501) {
      capabilities.stabilization = false;
      console.log('Stabilization not supported (status:', res.status, ')');
    }
  } catch (err) {
    console.warn('Failed to detect stabilization capability:', err);
  }

  // Test autofocus
  try {
    const res = await fetch(`${API_BASE}/cameras/${CAMERA_ID}/autofocus`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ enable: true }),
    });
    if (res.status === 500 || res.status === 501) {
      capabilities.autofocus = false;
      console.log('Autofocus not supported (status:', res.status, ')');
    }
  } catch (err) {
    console.warn('Failed to detect autofocus capability:', err);
  }

  // Test focus (GET should succeed if supported)
  try {
    const res = await fetch(`${API_BASE}/cameras/${CAMERA_ID}/focus`);
    if (res.status === 500 || res.status === 501) {
      capabilities.focus = false;
      capabilities.autofocus = false;
      console.log('Focus not supported (status:', res.status, ')');
    }
  } catch (err) {
    console.warn('Failed to detect focus capability:', err);
  }

  // Test zoom
  try {
    const res = await fetch(`${API_BASE}/cameras/${CAMERA_ID}/zoom`);
    if (res.status === 500 || res.status === 501) {
      capabilities.zoom = false;
      console.log('Zoom not supported (status:', res.status, ')');
    }
  } catch (err) {
    console.warn('Failed to detect zoom capability:', err);
  }

  console.log('Detected capabilities:', capabilities);
  return capabilities;
}
