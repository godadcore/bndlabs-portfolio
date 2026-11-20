export function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const width = image.naturalWidth;
      const height = image.naturalHeight;
      const sample = 32;
      canvas.width = sample;
      canvas.height = sample;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      context.drawImage(image, 0, 0, sample, sample);
      const pixels = context.getImageData(0, 0, sample, sample).data;
      let red = 0;
      let green = 0;
      let blue = 0;
      const count = pixels.length / 4;
      for (let index = 0; index < pixels.length; index += 4) {
        red += pixels[index];
        green += pixels[index + 1];
        blue += pixels[index + 2];
      }
      resolve({
        url,
        width,
        height,
        bytes: file.size,
        average: {
          red: Math.round(red / count),
          green: Math.round(green / count),
          blue: Math.round(blue / count),
        },
      });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("This file could not be read as an image."));
    };
    image.src = url;
  });
}
