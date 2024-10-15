import { FFmpeg } from '@ffmpeg/ffmpeg'
import { SupportedVideoFormat, supportedVideoFormats } from '../../supportedFormats'
import { fetchFile } from '@ffmpeg/util'
import ffmpegOutput from './ffmpegOutput'
import * as fc from './filterComplex'

export default async function convertVideo(
    ffmpeg: FFmpeg,
    file: File,
    videoWidth: number,
    videoHeight: number,
    outputFileName: string,
    formatKey: SupportedVideoFormat,
    maxGifColors: number
) {
    const inputFileName = file.name;
    
    await ffmpeg.writeFile(inputFileName, await fetchFile(file));

    const complexFilter = formatKey === supportedVideoFormats.gif.key ?
        fc.compose(
            fc.split({
                input: ['0:v'],
                output: ['s0', 's1']
            }),
            fc.palettegen({
                input: ['s0'],
                output: ['p'],
                maxColors: maxGifColors
            }),
            fc.paletteuse({
                input: ['s1', 'p']
            })
        ) :
        null;

    await ffmpeg.exec([
        '-i', inputFileName,
        '-avoid_negative_ts', 'make_zero', // https://superuser.com/questions/1167958/video-cut-with-missing-frames-in-ffmpeg
        ...(complexFilter ?
            ['-filter_complex', complexFilter] :
            []),
        ...(ffmpegOutput(formatKey, outputFileName, videoWidth, videoHeight))
    ]);

    const data = await ffmpeg.readFile(outputFileName);

    await ffmpeg.deleteFile(inputFileName);

    return data;
}