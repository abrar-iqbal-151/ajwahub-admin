/**
 * Helper function to create an HTML Image element from a source URL
 */
export const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous'); // needed to avoid cross-origin issues on CodePen/StackBlitz
    image.src = url;
  });

/**
 * Helper to convert degrees to radians
 */
export function getRadianAngle(degreeValue) {
  return (degreeValue * Math.PI) / 180;
}

/**
 * Returns the cropped image as a blob
 * @param {string} imageSrc - The source of the image to crop
 * @param {Object} pixelCrop - The pixel crop area returned by react-easy-crop
 * @param {number} rotation - Optional rotation angle in degrees
 */
export async function getCroppedImg(imageSrc, pixelCrop, rotation = 0) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  // Set width and height of the canvas matching the crop box size
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Draw the cropped image onto the canvas
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Return a promise that resolves with a Blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((file) => {
      if (file) {
        resolve(file);
      } else {
        reject(new Error('Canvas is empty'));
      }
    }, 'image/jpeg');
  });
}
