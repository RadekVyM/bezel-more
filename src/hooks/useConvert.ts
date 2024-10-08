import { useRef, useState } from 'react'
import { convertVideoScene } from '../services/conversion/convertVideoScene'
import { SupportedImageFormat, supportedImageFormats, SupportedVideoFormat, supportedVideoFormats } from '../supportedFormats'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { getFirstVideo } from '../types/VideoScene'
import useConversionProgress from './useConversionProgress'
import { toBlobURL } from '@ffmpeg/util'
import { Scene } from '../types/Scene'
import { generateScene } from '../services/drawing/scene'

export default function useConvert(
    scene: Scene,
) {
    const ffmpegRef = useRef(new FFmpeg());
    const [result, setResult] = useState<string | null>(null);
    const [resultFileName, setResultFileName] = useState<string | null>(null);
    const [resultSize, setResultSize] = useState(0);
    const [resultFormatKey, setResultFormatKey] = useState<SupportedVideoFormat | SupportedImageFormat>(scene.formatKey);
    const { progress, resetProgress, updateProgress } = useConversionProgress(ffmpegRef.current);

    async function convert() {
        updateProgress({ converting: true });
        setResult(null);
        setResultFileName(null);
        setResultSize(0);

        if (scene.sceneType === 'video') {
            const format = supportedVideoFormats[scene.formatKey];

            try {
                const ffmpeg = ffmpegRef.current;

                updateProgress({ state: 'Loading ffmpeg' });
                // When cache is used, it is alright to reload FFmpeg before each render
                await loadFFmpeg(ffmpeg);

                const data = (await convertVideoScene(ffmpeg, scene, (state) => updateProgress({ state }))) as any;
                const resultUrl = URL.createObjectURL(new Blob([data.buffer], { type: format.type }));

                setResult(resultUrl);
                setResultSize(data.byteLength);
                setResultFileName((getFirstVideo(scene).file?.name || 'undefined') + format.suffix);
                setResultFormatKey(format.key);

                ffmpeg.terminate();
            }
            catch (error) {
                // TODO: Display an error message
                console.error(error);

                setResult(null);
                setResultSize(0);
                setResultFileName(null);
            }
        }
        else if (scene.sceneType === 'image') {
            const format = supportedImageFormats[scene.formatKey];
            const fileName = (scene.media[0].file?.name || 'undefined') + format.suffix;

            updateProgress({ state: 'Rendering' });

            const image = await generateScene(scene, fileName, format.type);

            if (image) {
                const resultUrl = URL.createObjectURL(image);

                setResult(resultUrl);
                setResultSize(image.size);
                setResultFileName(fileName);
                setResultFormatKey(format.key);
            }
            else {
                setResult(null);
                setResultSize(0);
                setResultFileName(null);
            }
        }

        resetProgress();
    }

    return {
        convert,
        result,
        resultFileName,
        resultSize,
        resultFormatKey,
        progress
    };
}

async function loadFFmpeg(ffmpeg: FFmpeg) {
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
    
    // toBlobURL is used to bypass CORS issue, urls with the same
    // domain can be used directly.
    await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
}