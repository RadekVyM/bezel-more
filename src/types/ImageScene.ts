import { SupportedImageFormat } from '../supportedFormats'
import { DrawableScene } from './DrawableScene'
import { Image } from './Image'

export type ImageScene = {
    sceneType: 'image',
    media: Array<Image>,
    formatKey: SupportedImageFormat,
} & DrawableScene

export function getFirstImage(scene: ImageScene): Image {
    return scene.media[0];
}