import { MdOutlineVideoLibrary } from 'react-icons/md'
import { cn } from '../../utils/tailwind'
import Button from '../inputs/Button'
import { ConversionProgress } from '../../types/ConversionProgress'
import { FiDownload } from 'react-icons/fi'
import Container from '../Container'
import { SupportedImageFormat, supportedImageFormats, SupportedVideoFormat, supportedVideoFormats } from '../../supportedFormats'

export default function ResultPreviewer(props: {
    resultUrl: string | null,
    fileName: string | null,
    resultSize: number,
    progress: ConversionProgress,
    formatKey: SupportedVideoFormat | SupportedImageFormat,
    className?: string
}) {
    return (
        <Container
            className={cn('flex flex-col gap-6 p-5', props.className)}>
            <div
                className='flex-1 flex items-center w-full overflow-hidden'>
                {
                    props.resultUrl ?
                        <>
                            {{...supportedVideoFormats, ...supportedImageFormats}[props.formatKey].type.startsWith('image') ?
                                <img className='max-h-full m-auto object-contain' src={props.resultUrl} alt='Result' /> :
                                <video className='max-h-full m-auto object-contain' loop autoPlay controls src={props.resultUrl} />}
                        </> :
                        <Progress
                            className='w-full'
                            progress={props.progress} />
                }
            </div>
            {
                props.resultUrl &&
                <div
                    className='flex items-center gap-4'>
                    <Button
                        href={props.resultUrl || undefined}
                        download={props.fileName || undefined}
                        disabled={!props.resultUrl}
                        className='gap-2'>
                        <FiDownload />
                        Download
                    </Button>
                    <span className='text-sm text-on-surface-container'>
                        {`${(props.resultSize / 1000000).toLocaleString(undefined, { style: 'unit', unit: 'megabyte', minimumFractionDigits: 2, maximumFractionDigits: 3 })}`}
                    </span>
                </div>
            }
        </Container>
    )
}

function Progress(props: {
    className?: string,
    progress: ConversionProgress
}) {
    return (
        <div
            className={cn('flex flex-col items-center justify-center pt-5 pb-6 text-on-surface-container-muted', props.className)}>
            <MdOutlineVideoLibrary
                className='w-8 h-8 mb-4' />
            <p
                className='text-sm font-semibold mb-2'>
                {props.progress.state}
            </p>
            {
                props.progress.converting && props.progress.progress <= 1 &&
                <p
                    className='text-sm'>
                    Progress: <span className='font-semibold'>{props.progress.progress.toLocaleString(undefined, { style: 'percent' })}</span> | Frame: <span className='font-semibold'>{props.progress.frame}</span> | Speed: <span className='font-semibold'>{props.progress.speed}</span>
                </p>
            }
        </div>
    )
}