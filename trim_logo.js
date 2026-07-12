const Jimp = require('jimp');

Jimp.read('src/assets/logo.png')
  .then(image => {
    image.autocrop();
    return image.writeAsync('src/assets/logo.png');
  })
  .then(() => {
    console.log('Image cropped successfully');
  })
  .catch(err => {
    console.error(err);
  });
