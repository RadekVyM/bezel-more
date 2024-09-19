import { MdOutlineVideoLibrary } from 'react-icons/md'
import { cn } from '../../utils/tailwind'
import Button from '../inputs/Button'
import { ConversionProgress } from '../../types/ConversionProgress'
import { FiDownload } from 'react-icons/fi'
import Container from '../Container'
import { SupportedImageFormat, supportedImageFormats, SupportedVideoFormat, supportedVideoFormats } from '../../supportedFormats'

type ResultPreviewerProps = {
    resultUrl: string | null,
    fileName: string | null,
    resultSize: number,
    progress: ConversionProgress,
    formatKey: SupportedVideoFormat | SupportedImageFormat,
    className?: string
}

type ProgressProps = {
    className?: string,
    progress: ConversionProgress
}

export default function ResultPreviewer({ resultUrl, fileName, resultSize, progress, formatKey, className }: ResultPreviewerProps) {
    return (
        <Container
            className={cn('flex flex-col gap-6 p-5', className)}>
            <div
                className='flex-1 flex items-center w-full overflow-hidden'>
                {
                    resultUrl ?
                        <>
                            {{...supportedVideoFormats, ...supportedImageFormats}[formatKey].type.startsWith('image') ?
                                <img className='max-h-full m-auto object-contain' src={resultUrl} alt='Result' /> :
                                <video className='max-h-full m-auto object-contain' loop autoPlay controls src={resultUrl} />}
                        </> :
                        <Progress
                            className='w-full'
                            progress={progress} />
                }
            </div>
            {
                resultUrl &&
                <div
                    className='flex items-center gap-4'>
                    <Button
                        href={resultUrl || undefined}
                        download={fileName || undefined}
                        disabled={!resultUrl}
                        className='gap-2'>
                        <FiDownload />
                        Download
                    </Button>
                    <span className='text-sm text-on-surface-container'>
                        {`${(resultSize / 1000000).toLocaleString(undefined, { style: 'unit', unit: 'megabyte', minimumFractionDigits: 2, maximumFractionDigits: 3 })}`}
                    </span>
                </div>
            }
        </Container>
    )
}

function Progress({ className, progress }: ProgressProps) {
    return (
        <div
            className={cn('flex flex-col items-center justify-center pt-5 pb-6 text-on-surface-container-muted', className)}>
            <MdOutlineVideoLibrary
                className='w-8 h-8 mb-4' />
            <p
                className='text-sm font-semibold mb-2'>
                {progress.state}
            </p>
            {
                progress.converting && progress.progress <= 1 &&
                <p
                    className='text-sm'>
                    Progress: <span className='font-semibold'>{progress.progress.toLocaleString(undefined, { style: 'percent' })}</span> | Frame: <span className='font-semibold'>{progress.frame}</span> | Speed: <span className='font-semibold'>{progress.speed}</span>
                </p>
            }
        </div>
    )
}