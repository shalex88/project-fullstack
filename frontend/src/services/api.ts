const BACKEND_IP = import.meta.env.VITE_BACKEND_IP || 'localhost';
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
  const res = await fetch(`${API_BASE}/cameras/${CAMERA_ID}/stream/url`);
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
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ zoom }),
  });
  if (!res.ok) throw new Error('Failed to set zoom');
  const data = await res.json();
  return data.zoom;
}

export async function goToMinZoom(): Promise<void> {
  const res = await fetch(`${API_BASE}/cameras/${CAMERA_ID}/zoom/min`, {
    method: 'PUT',
  });
  if (!res.ok) throw new Error('Failed to set zoom to minimum');
}

export async function goToMaxZoom(): Promise<void> {
  const res = await fetch(`${API_BASE}/cameras/${CAMERA_ID}/zoom/max`, {
    method: 'PUT',
  });
  if (!res.ok) throw new Error('Failed to set zoom to maximum');
}

export async function getFocus(): Promise<number> {
  const res = await fetch(`${API_BASE}/cameras/${CAMERA_ID}/focus`);
  if (!res.ok) throw new Error('Failed to fetch focus');
  const data = await res.json();
  return data.focus;
}

export async function setFocus(focus: number): Promise<number> {
  const res = await fetch(`${API_BASE}/cameras/${CAMERA_ID}/focus`, {
    method: 'PUT',
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

export async function getCapabilities(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/cameras/${CAMERA_ID}/capabilities`);
  if (!res.ok) throw new Error('Failed to fetch capabilities');
  const data = await res.json();
  return data.capabilities;
}

export async function setAutofocus(enable: boolean): Promise<boolean> {
  const res = await fetch(`${API_BASE}/cameras/${CAMERA_ID}/autofocus`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ enable }),
  });
  if (!res.ok) throw new Error('Failed to set autofocus');
  const data = await res.json();
  return data.enable;
}

export async function getCameraStabilization(): Promise<boolean> {
  const res = await fetch(`${API_BASE}/cameras/${CAMERA_ID}/stabilization`);
  if (!res.ok) throw new Error('Failed to fetch camera stabilization');
  const data = await res.json();
  return data.enable;
}

export async function setCameraStabilization(enable: boolean): Promise<boolean> {
  const res = await fetch(`${API_BASE}/cameras/${CAMERA_ID}/stabilization`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ enable }),
  });
  if (!res.ok) throw new Error('Failed to set camera stabilization');
  const data = await res.json();
  return data.enable;
}

export async function getVideoCapabilities(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/cameras/${CAMERA_ID}/video/capabilities`);
  if (!res.ok) throw new Error('Failed to fetch video capabilities');
  const data = await res.json();
  return data.capabilities;
}

export async function getVideoCapabilityState(capability: string): Promise<boolean> {
  const encodedCapability = encodeURIComponent(capability);
  const res = await fetch(`${API_BASE}/cameras/${CAMERA_ID}/video/capabilities/${encodedCapability}`);
  if (!res.ok) throw new Error(`Failed to get video capability state: ${capability}`);
  const data = await res.json();
  return data.enable;
}

export async function setVideoCapability(capability: string, enable: boolean): Promise<boolean> {
  const encodedCapability = encodeURIComponent(capability);
  const res = await fetch(`${API_BASE}/cameras/${CAMERA_ID}/video/capabilities/${encodedCapability}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ enable }),
  });
  if (!res.ok) throw new Error(`Failed to set video capability: ${capability}`);
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
  try {
    // Fetch capabilities from API
    const capabilityList = await getCapabilities();
    const capabilitySet = new Set(capabilityList.map(c => c.toUpperCase()));

    const capabilities: CameraCapabilities = {
      zoom: capabilitySet.has('ZOOM'),
      focus: capabilitySet.has('FOCUS'),
      autofocus: capabilitySet.has('AUTO_FOCUS'),
      stabilization: capabilitySet.has('STABILIZATION'),
    };

    console.log('Detected capabilities:', capabilities);
    return capabilities;
  } catch (err) {
    console.warn('Failed to detect capabilities, using defaults:', err);
    // Fallback to defaults if API fails
    const capabilities: CameraCapabilities = {
      zoom: true,
      focus: true,
      autofocus: true,
      stabilization: true,
    };
    return capabilities;
  }
}
