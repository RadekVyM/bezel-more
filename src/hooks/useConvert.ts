import { useState } from 'react'
import { getBezel } from '../bezels'
import { convertWithBezel, convertWithoutBezel } from '../services/video/converters'
import { supportedFormats } from '../supportedFormats'
import { ConversionConfig } from '../services/video/ConversionConfig'
import { FFmpeg } from '@ffmpeg/ffmpeg'

export default function useConvert(
    conversionConfig: ConversionConfig,
    ffmpeg: FFmpeg,
    video: File | null | undefined,
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

        const bezel = getBezel(conversionConfig.bezelKey);
        const format = Object.values(supportedFormats).filter((f) => f.key === conversionConfig.formatKey)[0];

        try {
            if (!video)
                throw new Error('No file selected');

            const data = (conversionConfig.withBezel ?
                await convertWithBezel(ffmpeg, video, bezel, conversionConfig) :
                await convertWithoutBezel(ffmpeg, video, conversionConfig)) as any;

            const resultUrl = URL.createObjectURL(new Blob([data.buffer], { type: format.type }));

            setResult(resultUrl);
            setResultSize(data.byteLength);
            setResultFileName(video.name + format.suffix);
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