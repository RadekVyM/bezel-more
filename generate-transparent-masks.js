/*
    Simple script for automatic generation of transparent variants of mask images.
    
    sudo apt install imagemagick
    node ./generate-transparent-masks.js
*/

const path = require('path');
const im = require('imagemagick');
const FS = require('node:fs');

const MASK_IMAGE_SUFFIX = '_mask';
const TRANSPARENT_MASK_IMAGE_SUFFIX = 't';

const filteredStrings = [MASK_IMAGE_SUFFIX];
const bezelsDirectory = './public/images/bezels';
const files = FS.readdirSync(bezelsDirectory);

const imagesToResize = files
    .filter((img) => filteredStrings
        .some((str) => splitFileName(img)[0].endsWith(str)));

generateTransparentVariants(imagesToResize);

console.log(JSON.stringify(imagesToResize));

function generateTransparentVariants(images) {
    for (const image of images) {
        const [fileName, fileExtension] = splitFileName(image);
        const imagePath = path.resolve(`${bezelsDirectory}/${image}`);
        const newImagePath = path.resolve(`${bezelsDirectory}/${fileName}${TRANSPARENT_MASK_IMAGE_SUFFIX}${fileExtension}`);

        if (FS.existsSync(newImagePath))
            continue;

        im.convert(
            [imagePath, '-transparent', 'black', '-fill', 'black', '+opaque', 'none', newImagePath],
            (err, stdout) => {
                if (err)
                    throw err;
                console.log(`Converted: ${image}`);
            }
        )
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