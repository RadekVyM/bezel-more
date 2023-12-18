import { fetchFile } from '@ffmpeg/util'
import { getBezelSize } from '../../utils/size'
import { bezelImage, bezelMask } from '../../bezels'

// https://www.ffmpeg.org/ffmpeg.html
// https://ffmpeg.org/ffmpeg-filters.html
// https://github.com/leandromoreira/ffmpeg-libav-tutorial
// https://ffmpegwasm.netlify.app/docs/getting-started/usage/

export async function convertToGifWithBezel(ffmpeg, videoFile, bezel, config) {
    const videoName = videoFile.name;
    const bezelName = 'bezel.png';
    const bezelMaskName = bezelMask(bezel.modelKey).split('/').slice(0, -1)[0];
    const gifName = videoName.split('.').slice(0, -1).join('.') + '.gif';

    await ffmpeg.writeFile(videoName, await fetchFile(videoFile));
    await ffmpeg.writeFile(bezelName, await fetchFile(bezelImage(bezel.key)));
    await ffmpeg.writeFile(bezelMaskName, await fetchFile(bezelMask(bezel.modelKey)));

    const [width, height] = getBezelSize(bezel, config.size);
    const videoScale = bezel.contentScale;

    const start = config.start || 0;
    const end = config.end || 1;
    const length = end - start;

    await ffmpeg.exec([
        '-i', videoName,
        '-i', bezelName,
        '-i', bezelMaskName,
        '-filter_complex',
        `[0:v]
        scale=w=${width * videoScale}:h=${height * videoScale}:force_original_aspect_ratio=decrease:flags=lanczos[scaled-video];
        [scaled-video]
        format=rgba,
        pad=width=${width}:height=${height}:x=(ow-iw)/2:y=(oh-ih)/2:color=black@0[padded-video];
        [1:v]
        scale=w=${width}:h=${height}:force_original_aspect_ratio=decrease:flags=lanczos[scaled-bezel];
        [padded-video][scaled-bezel]
        overlay=0:0[merged];
        [2:v][merged]scale2ref[scaled-mask][merged-2];
        [merged-2][scaled-mask]alphamerge,
        fps=${config.fps},
        split[s0][s1];
        [s0]palettegen=max_colors=${config.maxColors}[p];
        [s1][p]paletteuse=dither=bayer`,
        '-t', `${length}`, '-ss', `${start}`, '-f', 'gif', gifName
    ]);

    return await ffmpeg.readFile(gifName);
}

export async function convertToGif(ffmpeg, videoFile, filterComplexConfig) {
    const videoName = videoFile.name;
    const gifName = videoName.split('.').slice(0, -1).join('.') + '.gif';

    await ffmpeg.writeFile(videoName, await fetchFile(videoFile));

    const start = filterComplexConfig.start || 0;
    const end = filterComplexConfig.end || 1;
    const length = end - start;

    await ffmpeg.exec([
        '-i', videoName,
        '-filter_complex',
        `[0:v]
        format=rgba,
        scale=w=${filterComplexConfig.size}:h=${filterComplexConfig.size}:force_original_aspect_ratio=decrease:flags=lanczos[scaled-video];
        [scaled-video]
        fps=${filterComplexConfig.fps},
        split[s0][s1];
        [s0]palettegen=max_colors=${filterComplexConfig.maxColors}[p];
        [s1][p]paletteuse=dither=bayer`,
        '-t', `${length}`, '-ss', `${start}`, '-f', 'gif', gifName
    ]);

    return await ffmpeg.readFile(gifName);
}