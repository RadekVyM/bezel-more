import { useRef, useState } from 'react'
import { convertScene } from '../services/conversion/converters'
import { SupportedFormat, supportedFormats } from '../supportedFormats'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { Scene, getFirstVideo } from '../types/Scene'
import useConversionProgress from './useConversionProgress'
import { toBlobURL } from '@ffmpeg/util'

export default function useConvert(
    scene: Scene,
) {
    const ffmpegRef = useRef(new FFmpeg());
    const [result, setResult] = useState<string | null>(null);
    const [resultFileName, setResultFileName] = useState<string | null>(null);
    const [resultSize, setResultSize] = useState(0);
    const [resultFormatKey, setResultFormatKey] = useState<SupportedFormat>(scene.formatKey);
    const { progress, resetProgress, updateProgress } = useConversionProgress(ffmpegRef.current);

    async function convert() {
        updateProgress({ converting: true });
        setResult(null);
        setResultFileName(null);
        setResultSize(0);

        const format = supportedFormats[scene.formatKey];

        try {
            const ffmpeg = ffmpegRef.current;

            updateProgress({ state: 'Loading ffmpeg' });
            // When cache is used, it is alright to reload FFmpeg before each render
            await loadFFmpeg(ffmpeg);

            const data = (await convertScene(ffmpeg, scene, (state) => updateProgress({ state }))) as any;
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