import { useRef, useState } from 'react'
import { convertVideoSceneFFmpeg } from '../services/conversion/convertVideoSceneFFmpeg'
import { SupportedImageFormat, supportedImageFormats, SupportedVideoFormat, supportedVideoFormats } from '../supportedFormats'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import useConversionProgress from './useConversionProgress'
import { toBlobURL } from '@ffmpeg/util'
import { Scene } from '../types/Scene'
import { generateScene } from '../services/drawing/scene'
import ffmpegCoreJsUrl from '@ffmpeg/core?url'
import ffmpegCoreWasmUrl from '@ffmpeg/core/wasm?url'
import { convertVideoSceneToWebmUsingCanvas } from '../services/conversion/convertVideoSceneToWebmUsingCanvas'
import convertVideo from '../services/conversion/convertVideo'

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
            const outputFileName = `result${format.suffix}`;

            try {
                if (scene.useCanvas) {
                    const { videoFile, videoHeight, videoWidth } = await convertVideoSceneToWebmUsingCanvas(scene, updateProgress);

                    const ffmpeg = ffmpegRef.current;

                    updateProgress({ state: 'Loading ffmpeg' });
                    // When cache is used, it is alright to reload FFmpeg before each render
                    await loadFFmpeg(ffmpeg, !scene.useUnpkg);

                    updateProgress({ state: 'Generating final result' });
                    const data = (await convertVideo(
                        ffmpeg,
                        videoFile,
                        videoWidth,
                        videoHeight,
                        outputFileName,
                        scene.formatKey,
                        scene.maxColors)) as any;
                    const resultUrl = URL.createObjectURL(new Blob([data.buffer], { type: format.type }));

                    setResult(resultUrl);
                    setResultSize(data.byteLength);
                    setResultFileName(outputFileName);
                    setResultFormatKey(format.key);

                    ffmpeg.terminate();
                }
                else {
                    const ffmpeg = ffmpegRef.current;

                    updateProgress({ state: 'Loading ffmpeg' });
                    // When cache is used, it is alright to reload FFmpeg before each render
                    await loadFFmpeg(ffmpeg, !scene.useUnpkg);

                    const data = (await convertVideoSceneFFmpeg(ffmpeg, scene, (state) => updateProgress({ state }))) as any;
                    const resultUrl = URL.createObjectURL(new Blob([data.buffer], { type: format.type }));

                    setResult(resultUrl);
                    setResultSize(data.byteLength);
                    setResultFileName(outputFileName);
                    setResultFormatKey(format.key);

                    ffmpeg.terminate();
                }
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

async function loadFFmpeg(ffmpeg: FFmpeg, localSource?: boolean, useMultiThreading: boolean = false) {
    // There are problems with the multithreading: https://github.com/ffmpegwasm/ffmpeg.wasm/issues/597
    const packageName = useMultiThreading ? 'core-mt' : 'core';
    const packageVersion = useMultiThreading ? '0.12.6' : '0.12.6';
    const baseURL = `https://unpkg.com/@ffmpeg/${packageName}@${packageVersion}/dist/esm`;
    const coreURL = localSource ? `${ffmpegCoreJsUrl}` : `${baseURL}/ffmpeg-core.js`;
    const wasmURL = localSource ? `${ffmpegCoreWasmUrl}` : `${baseURL}/ffmpeg-core.wasm`;

    // toBlobURL is used to bypass CORS issue, urls with the same
    // domain can be used directly.
    await ffmpeg.load({
        coreURL: await toBlobURL(coreURL, 'text/javascript'),
        wasmURL: await toBlobURL(wasmURL, 'application/wasm'),
        workerURL: useMultiThreading ? await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript') : undefined,
    });
}