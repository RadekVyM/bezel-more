import { useState } from 'react'
import { convertScene } from '../services/video/converters'
import { supportedFormats } from '../supportedFormats'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { Scene, getFirstVideo } from '../types/Scene'

export default function useConvert(
    scene: Scene,
    ffmpeg: FFmpeg,
    resetProgress: () => void
) {
    const [result, setResult] = useState<string | null>(null);
    const [resultFileName, setResultFileName] = useState<string | null>(null);
    const [resultSize, setResultSize] = useState(0);
    const [converting, setConverting] = useState(false);

    async function convert() {
        setConverting(true);
        setResult(null);
        setResultFileName(null);
        setResultSize(0);

        const format = Object.values(supportedFormats).filter((f) => f.key === scene.formatKey)[0];

        try {
            const data = (await convertScene(ffmpeg, scene)) as any;
            const resultUrl = URL.createObjectURL(new Blob([data.buffer], { type: format.type }));

            setResult(resultUrl);
            setResultSize(data.byteLength);
            setResultFileName((getFirstVideo(scene).file?.name || 'undefined') + format.suffix);
        }
        catch (error) {
            // TODO: Display an error message
            console.error(error);

            setResult(null);
            setResultSize(0);
            setResultFileName(null);
        }

        resetProgress();
        setConverting(false);
    }

    return {
        convert,
        result,
        resultFileName,
        resultSize,
        converting
    }
}