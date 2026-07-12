const { Jimp } = require('jimp');

async function trimLogo() {
  try {
    const image = await Jimp.read('src/assets/logo.png');
    image.autocrop();
    await image.write('src/assets/logo.png');
    console.log('Image cropped successfully');
  } catch (err) {
    console.error(err);
  }
}

trimLogo();
