import { Jimp } from 'jimp';

async function removeBg() {
  try {
    const image = await Jimp.read('public/icon.png');
    const data = image.bitmap.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i+1];
      const b = data[i+2];
      const a = data[i+3];
      
      let newAlpha = a;
      
      if (r > 240 && g > 240 && b > 240) {
        newAlpha = 0;
      } else if (r > 200 && g > 200 && b > 200) {
        const maxColor = Math.max(r, g, b);
        const factor = (255 - maxColor) / 55;
        newAlpha = Math.round(a * factor);
      }
      
      data[i+3] = newAlpha;
    }
    
    await image.write('public/icon_transparent.png');
    console.log('Background removed successfully.');
  } catch (err) {
    console.error('Error:', err);
  }
}

removeBg();
