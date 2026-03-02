'use client';

import { useState } from 'react';

export function useCvUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function upload(file: File): Promise<string | null> {
    setUploading(true);
    setError('');

    const body = new FormData();
    body.append('file', file);

    try {
      const res = await fetch('/api/parse-cv', { method: 'POST', body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Upload failed');
      return data.text as string;
    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setUploading(false);
    }
  }

  return { upload, uploading, error };
}
