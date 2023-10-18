import { fetchFile, toBlobURL } from '@ffmpeg/util'
import { getBezelSize } from '../../utils/size'

// https://gist.github.com/witmin/1edf926c2886d5c8d9b264d70baf7379

export async function convertToWebpWithBezel(ffmpeg, videoFile, bezel, config) {
    const videoName = videoFile.name;
    const bezelName = 'bezel.png';
    const bezelMaskName = bezel.mask.split('/').slice(0, -1)[0];
    const webpFileName = videoName.split('.').slice(0, -1).join('.') + '.webp';

    await ffmpeg.writeFile(videoName, await fetchFile(videoFile));
    await ffmpeg.writeFile(bezelName, await fetchFile(bezel.image));
    await ffmpeg.writeFile(bezelMaskName, await fetchFile(bezel.mask));

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
        fps=${config.fps}`,
        '-vcodec', 'libwebp',
        '-lossless', '1',
        '-loop', '0',
        '-preset', 'picture',
        '-an', '-vsync', '0',
        '-s', `${width}:${height}`,
        '-t', `${length}`, '-ss', `${start}`, webpFileName
    ]);

    return await ffmpeg.readFile(webpFileName);
}

export async function convertToWebp(ffmpeg, videoFile, config) {
    const videoName = videoFile.name;
    const webpFileName = videoName.split('.').slice(0, -1).join('.') + '.webp';

    await ffmpeg.writeFile(videoName, await fetchFile(videoFile));

    const start = config.start || 0;
    const end = config.end || 1;
    const length = end - start;

    await ffmpeg.exec([
        '-i', videoName,
        '-filter_complex',
        `[0:v]
        format=rgba,
        scale=w=${config.size}:h=${config.size}:force_original_aspect_ratio=decrease:flags=lanczos[scaled-video];
        [scaled-video]
        fps=${config.fps}`,
        '-vcodec', 'libwebp',
        '-lossless', '1',
        '-loop', '0',
        '-preset', 'picture',
        '-an', '-vsync', '0',
        '-t', `${length}`, '-ss', `${start}`, webpFileName
    ]);

    return await ffmpeg.readFile(webpFileName);
}