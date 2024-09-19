export const supportedVideoFormats = {
    webp: {
        key: 'webp',
        title: 'webp',
        suffix: '.webp',
        type: 'image/webp',
    },
    gif: {
        key: 'gif',
        title: 'gif',
        suffix: '.gif',
        type: 'image/gif',
    },
    mp4: {
        key: 'mp4',
        title: 'mp4',
        suffix: '.mp4',
        type: 'video/mp4',
    }
} as const;

export const supportedImageFormats = {
    webp: {
        key: 'webp',
        title: 'webp',
        suffix: '.webp',
        type: 'image/webp',
    },
    png: {
        key: 'png',
        title: 'png',
        suffix: '.png',
        type: 'image/png',
    },
} as const;

export type SupportedVideoFormat = 'webp' | 'gif' | 'mp4'

export type SupportedImageFormat = 'webp' | 'png'