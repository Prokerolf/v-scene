const { Jimp } = require('jimp');

async function checkLogo() {
  try {
    const image = await Jimp.read('src/assets/logo.png');
    console.log(`Width: ${image.bitmap.width}, Height: ${image.bitmap.height}`);
  } catch (err) {
    console.error(err);
  }
}

checkLogo();
