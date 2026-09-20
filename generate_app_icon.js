import sharp from 'sharp';
import path from 'path';

async function generateIcons() {
  const logoPath = path.resolve('src/assets/logo.png');

  // 1. Trim empty/transparent borders around the logo
  const trimmedBuffer = await sharp(logoPath)
    .trim()
    .toBuffer();

  const trimmedMeta = await sharp(trimmedBuffer).metadata();
  console.log('Trimmed Logo Size:', trimmedMeta.width, 'x', trimmedMeta.height);

  // 2. Resize trimmed logo to maximum prominent height & width (460px inside 512px canvas)
  const resizedBuffer = await sharp(trimmedBuffer)
    .resize({
      width: 470,
      height: 470,
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .toBuffer();

  const resizedMeta = await sharp(resizedBuffer).metadata();

  // 3. Composite onto 512x512 solid white canvas
  const finalIconBuffer = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
  .composite([
    {
      input: resizedBuffer,
      top: Math.round((512 - resizedMeta.height) / 2),
      left: Math.round((512 - resizedMeta.width) / 2)
    }
  ])
  .png()
  .toBuffer();

  // Save to public icon destinations
  await sharp(finalIconBuffer).toFile('public/apple-touch-icon.png');
  await sharp(finalIconBuffer).toFile('public/apple-touch-icon-precomposed.png');
  await sharp(finalIconBuffer).toFile('public/logo.png');
  await sharp(finalIconBuffer).toFile('public/assets/logo.png');

  console.log('Successfully generated trimmed & max-enlarged 512x512 app icons!');
}

generateIcons().catch(err => {
  console.error(err);
  process.exit(1);
});
