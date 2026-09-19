const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const MAX_BYTES = 8 * 1024 * 1024; // reject anything absurd before compressing

/** Shrink an image in the browser so uploads stay small on mobile data. */
export async function compressImage(file, { maxSize = 1200, quality = 0.82 } = {}) {
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file.');
  if (file.size > MAX_BYTES) throw new Error('That image is too large. Choose one under 8 MB.');

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', quality));
  // Safari may not encode webp; fall back to jpeg.
  if (blob && blob.type === 'image/webp') return blob;
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
}

/**
 * Upload an image to Cloudinary (unsigned preset) and return its https URL.
 * @param {File} file
 * @param {string} folder sub-folder inside ledgio/, e.g. "logos"
 */
export async function uploadImage(file, folder) {
  const blob = await compressImage(file);
  const form = new FormData();
  form.append('file', blob);
  form.append('upload_preset', PRESET);
  if (folder) form.append('folder', `ledgio/${folder}`);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error('Upload failed. Check your connection and try again.');
  const data = await res.json();
  return data.secure_url;
}
