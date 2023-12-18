/*
    Simple script for automatic generation of resized variants of bezel images.
    
    sudo apt install imagemagick
    node .\generate-bezel-variants.js
*/

const path = require('path');
const im = require('imagemagick');
const FS = require('node:fs');

const SMALL_IMAGE_HEIGHT = 400;
const SMALL_IMAGE_SUFFIX = '_small';

const filteredStrings = ['_mask', SMALL_IMAGE_SUFFIX];
const bezelsDirectory = './public/images/bezels';
const files = FS.readdirSync(bezelsDirectory);

const imagesToResize = files
    .filter((img) => !filteredStrings
        .some((str) => splitFileName(img)[0].endsWith(str)));

generateResizedVariants(imagesToResize);

console.log(JSON.stringify(imagesToResize));

function generateResizedVariants(images) {
    for (const image of images) {
        const [fileName, fileExtension] = splitFileName(image);
        const imagePath = path.resolve(`${bezelsDirectory}/${image}`);
        const newImagePath = path.resolve(`${bezelsDirectory}/${fileName}${SMALL_IMAGE_SUFFIX}${fileExtension}`);

        im.identify(imagePath, (err, features) => {
            if (err)
                throw err;

            const width = features.width * (SMALL_IMAGE_HEIGHT / features.width);

            im.convert(
                [imagePath, '-resize', `${width}x${SMALL_IMAGE_HEIGHT}`, newImagePath],
                (err, stdout) => {
                    if (err)
                        throw err;
                    console.log(`Resized: ${image}`);
                }
            )
        });
    }
}

function splitFileName(fileName) {
    const extname = path.extname(fileName);
    const name = path.basename(fileName, extname);

    return [
        name,
        extname
    ]
}