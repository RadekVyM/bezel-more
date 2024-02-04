import { createPortal } from 'react-dom'
import { ConversionConfig } from '../services/video/ConversionConfig'
import { getBezel } from '../bezels'
import { supportedFormats } from '../supportedFormats'
import { forwardRef, useState } from 'react'
import { convertWithBezel, convertWithoutBezel } from '../services/video/converters'
import ContentContainer from './ContentContainer'
import { MdOutlineVideoLibrary } from 'react-icons/md'
import Button from './Button'
import { ConversionProgress } from '../types/ConversionProgress'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import Loading from './Loading'
import { cn } from '../utils/tailwind'
import ConversionConfiguration from './ConversionConfiguration'
import { TiArrowRight } from 'react-icons/ti'
import ContentDialog from './ContentDialog'

type ConvertDialogProps = {
    conversionConfig: ConversionConfig,
    ffmpeg: FFmpeg,
    video: File | null | undefined,
    progress: ConversionProgress | null,
    animation: string,
    className?: string,
    slideInFromBottom?: boolean,
    hide: () => void,
    updateConversionConfig: (conversionConfig: Partial<ConversionConfig>) => void,
    resetProgress: () => void
}

type DialogContentProps = {
    conversionConfig: ConversionConfig,
    ffmpeg: FFmpeg,
    video: File | null | undefined,
    progress: ConversionProgress | null,
    hide: () => void,
    updateConversionConfig: (conversionConfig: Partial<ConversionConfig>) => void,
    resetProgress: () => void
}

type ResultProps = {
    resultUrl: string | null,
    fileName: string | null,
    resultSize: number,
    progress: ConversionProgress | null,
    className?: string
}

type ConvertButtonProps = {
    convert: () => void,
    disabled: boolean,
    converting: boolean,
    className?: string
}

const ConvertDialog = forwardRef<HTMLDialogElement, ConvertDialogProps>(({ hide, animation, className, conversionConfig, ffmpeg, video, progress, slideInFromBottom, updateConversionConfig, resetProgress }, ref) => {
    return (
        createPortal(
            <ContentDialog
                ref={ref}
                heading={'Convert'}
                animation={animation}
                slideInFromBottom={slideInFromBottom}
                hide={hide}
                className={className}>
                <DialogContent
                    conversionConfig={conversionConfig}
                    updateConversionConfig={updateConversionConfig}
                    ffmpeg={ffmpeg}
                    video={video}
                    progress={progress}
                    resetProgress={resetProgress}
                    hide={hide} />
            </ContentDialog>,
            document.querySelector('body') as Element)
    )
});

ConvertDialog.displayName = 'ConvertDialog';
export default ConvertDialog;

function DialogContent({ conversionConfig, ffmpeg, video, progress, updateConversionConfig, resetProgress, hide }: DialogContentProps) {
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

    return (
        <>
            <ConversionConfiguration
                conversionConfig={conversionConfig}
                updateConversionConfig={updateConversionConfig} />

            <ConvertButton
                convert={convert}
                disabled={converting || !video}
                converting={converting}
                className='my-5' />

            <Result
                resultUrl={result}
                resultSize={resultSize}
                progress={progress}
                fileName={resultFileName} />
        </>
    )
}

function ConvertButton({ convert, disabled, converting, className }: ConvertButtonProps) {
    return (
        <Button
            className={cn('flex items-center', className)}
            onClick={convert}
            disabled={disabled}>
            <span className='mr-2'>Convert</span>
            {
                !converting ?
                    <TiArrowRight className='inline-block w-5 h-5' /> :
                    <Loading />
            }
        </Button>
    )
}

function Result({ resultUrl, fileName, resultSize, progress, className }: ResultProps) {
    return (
        <div
            className={cn('flex flex-col gap-6', className)}>
            <ContentContainer
                className='flex items-center p-5 w-full h-[37rem]'>
                {
                    resultUrl ?
                        <img className='max-h-full m-auto' src={resultUrl} alt='Result' /> :
                        <div
                            className='flex flex-col items-center justify-center pt-5 pb-6 w-full text-gray-500 dark:text-gray-400'>
                            <MdOutlineVideoLibrary
                                className='w-8 h-8 mb-4' />
                            {
                                progress && progress.progress <= 1 ?
                                    <p
                                        className='text-sm font-semibold'>
                                        {progress.progress.toLocaleString(undefined, { style: 'percent' })}
                                    </p> :
                                    <p
                                        className='text-sm'>
                                        No results yet
                                    </p>
                            }
                        </div>
                }
            </ContentContainer>
            <div
                className='flex items-center gap-4'>
                <Button
                    href={resultUrl || undefined}
                    download={fileName || undefined}
                    disabled={!resultUrl}>
                    Download
                </Button>
                <span className='text-sm text-gray-600 dark:text-gray-400'>
                    {`${(resultSize / 1000000).toLocaleString(undefined, { style: 'unit', unit: 'megabyte', minimumFractionDigits: 2, maximumFractionDigits: 3 })}`}
                </span>
            </div>
        </div>
    )
}