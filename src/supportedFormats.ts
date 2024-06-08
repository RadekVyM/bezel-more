export const supportedFormats = {
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

export type SupportedFormat = 'webp' | 'gif' | 'mp4'