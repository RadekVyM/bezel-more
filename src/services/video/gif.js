import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

export async function convertToGif(ffmpeg, videoFile, bezel, filterComplexConfig) {
    // https://www.ffmpeg.org/ffmpeg.html
    // https://ffmpeg.org/ffmpeg-filters.html
    // https://github.com/leandromoreira/ffmpeg-libav-tutorial
    // https://ffmpegwasm.netlify.app/docs/getting-started/usage/

    const videoName = videoFile.name;
    const bezelName = 'bezel.png';
    const gifName = videoName.split('.').slice(0, -1).join('.') + '.gif';

    await ffmpeg.writeFile(videoName, await fetchFile(videoFile));
    await ffmpeg.writeFile(bezelName, await fetchFile(bezel.image));

    const width = bezel.width <= bezel.height ? bezel.width * (filterComplexConfig.size / bezel.height) : filterComplexConfig.size;
    const height = bezel.width <= bezel.height ? filterComplexConfig.size : bezel.height * (filterComplexConfig.size / bezel.width);
    const videoScale = bezel.contentScale;

    await ffmpeg.exec([
        '-i', videoName,
        '-i', bezelName,
        '-filter_complex',
        `[0:v]
        scale=w=${width * videoScale}:h=${height * videoScale}:force_original_aspect_ratio=decrease:flags=lanczos[scaled-video];
        [scaled-video]
        format=rgba,
        pad=width=${width}:height=${height}:x=(ow-iw)/2:y=(oh-ih)/2:color=black@0[padded-video];
        [1:v]
        scale=w=${width}:h=${height}:force_original_aspect_ratio=decrease:flags=lanczos[scaled-bezel];
        [padded-video][scaled-bezel]
        overlay=0:0:enable='between(t,0,${filterComplexConfig.length})'[merged];
        [merged]
        fps=${filterComplexConfig.fps},
        split[s0][s1];
        [s0]palettegen=max_colors=${filterComplexConfig.maxColors}[p];
        [s1][p]paletteuse=dither=bayer`,
        '-t', `${filterComplexConfig.length}`, '-ss', '0.0', '-f', 'gif', gifName
    ]);

    return await ffmpeg.readFile(gifName);
}