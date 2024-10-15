import { SupportedVideoFormat, supportedVideoFormats } from '../../supportedFormats'
import { roundToEven } from '../../utils/numbers'

export default function ffmpegOutput(formatKey: SupportedVideoFormat, fileName: string, sceneWidth: number, sceneHeight: number) {
    switch (formatKey) {
        case supportedVideoFormats.gif.key:
            return gifOutput(fileName);
        case supportedVideoFormats.mp4.key:
            return mp4Output(fileName, [sceneWidth, sceneHeight]);
        case supportedVideoFormats.webm.key:
            return webmOutput(fileName, [sceneWidth, sceneHeight]);
        case supportedVideoFormats.webp.key:
            return webpOutput(fileName, [sceneWidth, sceneHeight]);
    }
}

function webpOutput(fileName: string, size?: [number, number]) {
    return [
        '-vcodec', 'libwebp',
        '-lossless', '1',
        '-loop', '0',
        '-preset', 'picture',
        '-an', '-fps_mode', 'auto', // https://ffmpeg.org/ffmpeg.html#:~:text=%2Dfps_mode%5B%3Astream_specifier%5D%20parameter%20(output%2Cper%2Dstream)
        ...(size ? ['-s', `${size[0]}:${size[1]}`] : []),
        fileName
    ];
}

function gifOutput(fileName: string) {
    return [
        '-f', 'gif', fileName
    ];
}

function mp4Output(fileName: string, size?: [number, number]) {
    return [
        '-an', '-sn', '-c:v', 'libx264',
        ...(size ? ['-s', `${roundToEven(size[0])}:${roundToEven(size[1])}`] : []), // size has to be divisible by 2
        fileName
    ];
}

function webmOutput(fileName: string, size?: [number, number]) {
    return [
        '-c:v', 'libvpx',
        '-crf', '23',
        '-auto-alt-ref', '0',
        ...(size ? ['-s', `${roundToEven(size[0])}:${roundToEven(size[1])}`] : []),
        fileName
    ];
}
