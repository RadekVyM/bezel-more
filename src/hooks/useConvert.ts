import { useState } from 'react'
import { convertScene } from '../services/conversion/converters'
import { SupportedFormat, supportedFormats } from '../supportedFormats'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { Scene, getFirstVideo } from '../types/Scene'
import { ConversionProgress } from '../types/ConversionProgress'

export default function useConvert(
    scene: Scene,
    ffmpeg: FFmpeg,
    resetProgress: () => void,
    updateProgress: (video: Partial<ConversionProgress>) => void
) {
    const [result, setResult] = useState<string | null>(null);
    const [resultFileName, setResultFileName] = useState<string | null>(null);
    const [resultSize, setResultSize] = useState(0);
    const [resultFormatKey, setResultFormatKey] = useState<SupportedFormat>(scene.formatKey);

    async function convert() {
        updateProgress({ converting: true });
        setResult(null);
        setResultFileName(null);
        setResultSize(0);

        const format = supportedFormats[scene.formatKey];

        try {
            const data = (await convertScene(ffmpeg, scene, (state) => updateProgress({ state }))) as any;
            const resultUrl = URL.createObjectURL(new Blob([data.buffer], { type: format.type }));

            setResult(resultUrl);
            setResultSize(data.byteLength);
            setResultFileName((getFirstVideo(scene).file?.name || 'undefined') + format.suffix);
            setResultFormatKey(format.key);
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
        resultFormatKey
    };
}