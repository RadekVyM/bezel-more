import { Bezel } from './types/Bezel'
import { MediumOrientation } from './types/MediumOrientation';

/**
 * Sources:
 * - https://developer.apple.com/design/resources/#product-bezels
 * - https://www.figma.com/community/file/1200838447651398282
 * - https://www.figma.com/community/file/1267909887907329958
 */

const BEZEL_IMAGE_EXTENSION = '.png';
const BEZEL_IMAGES_DIRECOTORY_PATH = 'images/bezels';

export const BEZELS = {
    iphone_15_black: {
        key: 'iphone_15_black',
        modelKey: 'iphone_15',
        title: 'iPhone 15 Black (19.5:9)',
        width: 1316,
        height: 2674,
        contentScale: 0.956
    } as Bezel,
    iphone_15_blue: {
        key: 'iphone_15_blue',
        modelKey: 'iphone_15',
        title: 'iPhone 15 Blue (19.5:9)',
        width: 1316,
        height: 2674,
        contentScale: 0.956
    } as Bezel,
    iphone_15_green: {
        key: 'iphone_15_green',
        modelKey: 'iphone_15',
        title: 'iPhone 15 Green (19.5:9)',
        width: 1316,
        height: 2674,
        contentScale: 0.956
    } as Bezel,
    iphone_15_pink: {
        key: 'iphone_15_pink',
        modelKey: 'iphone_15',
        title: 'iPhone 15 Pink (19.5:9)',
        width: 1316,
        height: 2674,
        contentScale: 0.956
    } as Bezel,
    iphone_15_yellow: {
        key: 'iphone_15_yellow',
        modelKey: 'iphone_15',
        title: 'iPhone 15 Yellow (19.5:9)',
        width: 1316,
        height: 2674,
        contentScale: 0.956
    } as Bezel,
    iphone_15_plus_black: {
        key: 'iphone_15_plus_black',
        modelKey: 'iphone_15_plus',
        title: 'iPhone 15 Plus Black (19.5:9)',
        width: 1426,
        height: 2914,
        contentScale: 0.956
    } as Bezel,
    iphone_15_plus_blue: {
        key: 'iphone_15_plus_blue',
        modelKey: 'iphone_15_plus',
        title: 'iPhone 15 Plus Blue (19.5:9)',
        width: 1426,
        height: 2914,
        contentScale: 0.956
    } as Bezel,
    iphone_15_plus_green: {
        key: 'iphone_15_plus_green',
        modelKey: 'iphone_15_plus',
        title: 'iPhone 15 Plus Green (19.5:9)',
        width: 1426,
        height: 2914,
        contentScale: 0.956
    } as Bezel,
    iphone_15_plus_pink: {
        key: 'iphone_15_plus_pink',
        modelKey: 'iphone_15_plus',
        title: 'iPhone 15 Plus Pink (19.5:9)',
        width: 1426,
        height: 2914,
        contentScale: 0.956
    } as Bezel,
    iphone_15_plus_yellow: {
        key: 'iphone_15_plus_yellow',
        modelKey: 'iphone_15_plus',
        title: 'iPhone 15 Plus Yellow (19.5:9)',
        width: 1426,
        height: 2914,
        contentScale: 0.956
    } as Bezel,
    iphone_15_pro_black: {
        key: 'iphone_15_pro_black',
        modelKey: 'iphone_15_pro',
        title: 'iPhone 15 Pro Black (19.5:9)',
        width: 1293,
        height: 2656,
        contentScale: 0.962
    } as Bezel,
    iphone_15_pro_blue: {
        key: 'iphone_15_pro_blue',
        modelKey: 'iphone_15_pro',
        title: 'iPhone 15 Pro Blue (19.5:9)',
        width: 1293,
        height: 2656,
        contentScale: 0.962
    } as Bezel,
    iphone_15_pro_natural_titanium: {
        key: 'iphone_15_pro_natural_titanium',
        modelKey: 'iphone_15_pro',
        title: 'iPhone 15 Pro Natural Titanium (19.5:9)',
        width: 1293,
        height: 2656,
        contentScale: 0.962
    } as Bezel,
    iphone_15_pro_white: {
        key: 'iphone_15_pro_white',
        modelKey: 'iphone_15_pro',
        title: 'iPhone 15 Pro White (19.5:9)',
        width: 1293,
        height: 2656,
        contentScale: 0.962
    } as Bezel,
    iphone_15_pro_max_black: {
        key: 'iphone_15_pro_max_black',
        modelKey: 'iphone_15_pro_max',
        title: 'iPhone 15 Pro Max Black (19.5:9)',
        width: 1404,
        height: 2896,
        contentScale: 0.962
    } as Bezel,
    iphone_15_pro_max_blue: {
        key: 'iphone_15_pro_max_blue',
        modelKey: 'iphone_15_pro_max',
        title: 'iPhone 15 Pro Max Blue (19.5:9)',
        width: 1404,
        height: 2896,
        contentScale: 0.962
    } as Bezel,
    iphone_15_pro_max_natural_titanium: {
        key: 'iphone_15_pro_max_natural_titanium',
        modelKey: 'iphone_15_pro_max',
        title: 'iPhone 15 Pro Max Natural Titanium (19.5:9)',
        width: 1404,
        height: 2896,
        contentScale: 0.962
    } as Bezel,
    iphone_15_pro_max_white: {
        key: 'iphone_15_pro_max_white',
        modelKey: 'iphone_15_pro_max',
        title: 'iPhone 15 Pro Max White (19.5:9)',
        width: 1404,
        height: 2896,
        contentScale: 0.962
    } as Bezel,
    iphone_14_pro: {
        key: 'iphone_14_pro',
        modelKey: 'iphone_14_pro',
        title: 'iPhone 14 Pro (19.5:9)',
        width: 2131,
        height: 4297,
        contentScale: 0.956
    } as Bezel,
    samsung_s23_phantom_black: {
        key: 'samsung_s23_phantom_black',
        modelKey: 'samsung_s23',
        title: 'Samsung Galaxy S23 Phantom Black (19.5:9)',
        width: 1275,
        height: 2614,
        contentScale: 0.956
    } as Bezel,
    samsung_s23_green: {
        key: 'samsung_s23_green',
        modelKey: 'samsung_s23',
        title: 'Samsung Galaxy S23 Green (19.5:9)',
        width: 1275,
        height: 2614,
        contentScale: 0.956
    } as Bezel,
    samsung_s23_lavender: {
        key: 'samsung_s23_lavender',
        modelKey: 'samsung_s23',
        title: 'Samsung Galaxy S23 Lavender (19.5:9)',
        width: 1275,
        height: 2614,
        contentScale: 0.956
    } as Bezel,
    samsung_s23_cream: {
        key: 'samsung_s23_cream',
        modelKey: 'samsung_s23',
        title: 'Samsung Galaxy S23 Cream (19.5:9)',
        width: 1275,
        height: 2614,
        contentScale: 0.956
    } as Bezel,
    samsung_s23_ultra_phantom_black: {
        key: 'samsung_s23_ultra_phantom_black',
        modelKey: 'samsung_s23_ultra',
        title: 'Samsung Galaxy S23 Ultra Phantom Black (19.3:9)',
        width: 1390,
        height: 2912,
        contentScale: 0.946
    } as Bezel,
    samsung_s23_ultra_green: {
        key: 'samsung_s23_ultra_green',
        modelKey: 'samsung_s23_ultra',
        title: 'Samsung Galaxy S23 Ultra Green (19.3:9)',
        width: 1390,
        height: 2912,
        contentScale: 0.946
    } as Bezel,
    samsung_s23_ultra_lavender: {
        key: 'samsung_s23_ultra_lavender',
        modelKey: 'samsung_s23_ultra',
        title: 'Samsung Galaxy S23 Ultra Lavender (19.3:9)',
        width: 1390,
        height: 2912,
        contentScale: 0.946
    } as Bezel,
    samsung_s23_ultra_cream: {
        key: 'samsung_s23_ultra_cream',
        modelKey: 'samsung_s23_ultra',
        title: 'Samsung Galaxy S23 Ultra Cream (19.3:9)',
        width: 1390,
        height: 2912,
        contentScale: 0.946
    } as Bezel,
    oneplus_7t_pro: {
        key: 'oneplus_7t_pro',
        modelKey: 'oneplus_7t_pro',
        title: 'OnePlus 7T Pro (19.5:9)',
        width: 1234,
        height: 2618,
        contentScale: 0.956
    } as Bezel,
    oneplus_8_pro: {
        key: 'oneplus_8_pro',
        modelKey: 'oneplus_8_pro',
        title: 'OnePlus 8 Pro (19.8:9)',
        width: 1188,
        height: 2606,
        contentScale: 0.952
    } as Bezel,
    sony_xperia_1_ii: {
        key: 'sony_xperia_1_ii',
        modelKey: 'sony_xperia_1_ii',
        title: 'Sony Experia 1 II (21:9)',
        width: 1134,
        height: 2609,
        contentScale: 0.915
    } as Bezel,
    pixel_8_obsidian: {
        key: 'pixel_8_obsidian',
        modelKey: 'pixel_8',
        title: 'Pixel 8 Obsidian (20:9)',
        width: 1235,
        height: 2575,
        contentScale: 0.947
    } as Bezel,
    pixel_8_hazel: {
        key: 'pixel_8_hazel',
        modelKey: 'pixel_8',
        title: 'Pixel 8 Hazel (20:9)',
        width: 1235,
        height: 2575,
        contentScale: 0.947
    } as Bezel,
    pixel_8_rose: {
        key: 'pixel_8_rose',
        modelKey: 'pixel_8',
        title: 'Pixel 8 Rose (20:9)',
        width: 1235,
        height: 2575,
        contentScale: 0.947
    } as Bezel,
    pixel_8_pro_obsidian: {
        key: 'pixel_8_pro_obsidian',
        modelKey: 'pixel_8_pro',
        title: 'Pixel 8 Pro Obsidian (20:9)',
        width: 1336,
        height: 2816,
        contentScale: 0.95
    } as Bezel,
    pixel_8_pro_bay: {
        key: 'pixel_8_pro_bay',
        modelKey: 'pixel_8_pro',
        title: 'Pixel 8 Pro Bay (20:9)',
        width: 1336,
        height: 2816,
        contentScale: 0.95
    } as Bezel,
    pixel_8_pro_porcelain: {
        key: 'pixel_8_pro_porcelain',
        modelKey: 'pixel_8_pro',
        title: 'Pixel 8 Pro Porcelain (20:9)',
        width: 1336,
        height: 2816,
        contentScale: 0.95
    } as Bezel,
    pixel_5: {
        key: 'pixel_5',
        modelKey: 'pixel_5',
        title: 'Pixel 5 (19.5:9)',
        width: 1260,
        height: 2564,
        contentScale: 0.95
    } as Bezel,
    'android_gold_19,5_9': {
        key: 'android_gold_19,5_9',
        modelKey: 'android_gold_19,5_9',
        title: 'Android Gold (19.5:9)',
        width: 620,
        height: 1300,
        contentScale: 0.968
    } as Bezel,
    'android_gray_19,5_9': {
        key: 'android_gray_19,5_9',
        modelKey: 'android_gray_19,5_9',
        title: 'Android Gray (19.5:9)',
        width: 932,
        height: 1920,
        contentScale: 0.958
    } as Bezel,
    'android_gray_20_9': {
        key: 'android_gray_20_9',
        modelKey: 'android_gray_20_9',
        title: 'Android Gray (20:9)',
        width: 911,
        height: 1920,
        contentScale: 0.960
    } as Bezel,
    'android_gray_21_9': {
        key: 'android_gray_21_9',
        modelKey: 'android_gray_21_9',
        title: 'Android Gray (21:9)',
        width: 872,
        height: 1920,
        contentScale: 0.970
    } as Bezel,
} as const;

export function getBezel(bezelKey: string) {
    return Object.values(BEZELS).filter((b) => b.key === bezelKey)[0];
}

export function bezelImage(bezelKey: string) {
    return `${BEZEL_IMAGES_DIRECOTORY_PATH}/${bezelKey}${BEZEL_IMAGE_EXTENSION}`;
}

export function bezelSmallImage(bezelKey: string) {
    return `${BEZEL_IMAGES_DIRECOTORY_PATH}/${bezelKey}_small${BEZEL_IMAGE_EXTENSION}`;
}

export function bezelMask(bezelKey: string) {
    return `${BEZEL_IMAGES_DIRECOTORY_PATH}/${bezelKey}_mask${BEZEL_IMAGE_EXTENSION}`;
}

export function bezelTransparentMask(bezelKey: string) {
    return `${BEZEL_IMAGES_DIRECOTORY_PATH}/${bezelKey}_maskt${BEZEL_IMAGE_EXTENSION}`;
}

export function getBezelSize(bezelKey: string, orientation: MediumOrientation): [number, number] {
    const bezel = getBezel(bezelKey);

    if (orientation === 'topUp' || orientation === 'bottomUp') {
        return [bezel.width, bezel.height];
    }
    else {
        return [bezel.height, bezel.width];
    }
}