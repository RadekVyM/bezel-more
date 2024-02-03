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
    }
} as const;

export type SupportedFormat = 'webp' | 'gif'