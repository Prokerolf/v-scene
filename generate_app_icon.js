import sharp from 'sharp';
import path from 'path';

async function generateIcons() {
  const logoPath = path.resolve('src/assets/logo.png');

  // 1. Load original logo metadata
  const metadata = await sharp(logoPath).metadata();
  console.log('Original Logo:', metadata.width, 'x', metadata.height);

  // Resize logo proportionally so width = 420px (preserving aspect ratio)
  const resizedLogoBuffer = await sharp(logoPath)
    .resize({ width: 420, fit: 'contain' })
    .toBuffer();

  const resizedMeta = await sharp(resizedLogoBuffer).metadata();

  // 2. Create 512x512 Square Canvas with Solid White background (standard iOS App Icon)
  const whiteIconBuffer = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
  .composite([
    {
      input: resizedLogoBuffer,
      top: Math.round((512 - resizedMeta.height) / 2),
      left: Math.round((512 - resizedMeta.width) / 2)
    }
  ])
  .png()
  .toBuffer();

  // Save to public icon destinations
  await sharp(whiteIconBuffer).toFile('public/apple-touch-icon.png');
  await sharp(whiteIconBuffer).toFile('public/apple-touch-icon-precomposed.png');
  await sharp(whiteIconBuffer).toFile('public/logo.png');
  await sharp(whiteIconBuffer).toFile('public/assets/logo.png');

  console.log('Successfully generated 512x512 proportional square app icons!');
}

generateIcons().catch(err => {
  console.error(err);
  process.exit(1);
});
