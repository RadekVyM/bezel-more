import { MdOutlineVideoLibrary } from 'react-icons/md'
import { cn } from '../utils/tailwind'
import Button from './Button'
import { ConversionProgress } from '../types/ConversionProgress'
import { FiDownload } from 'react-icons/fi'

type ResultPreviewerProps = {
    resultUrl: string | null,
    fileName: string | null,
    resultSize: number,
    progress: ConversionProgress | null,
    className?: string
}

export default function ResultPreviewer({ resultUrl, fileName, resultSize, progress, className }: ResultPreviewerProps) {
    return (
        <div
            className={cn('flex flex-col gap-6', className)}>
            <div
                className='flex-1 flex items-center w-full overflow-hidden'>
                {
                    resultUrl ?
                        <img className='max-h-full m-auto' src={resultUrl} alt='Result' /> :
                        <div
                            className='flex flex-col items-center justify-center pt-5 pb-6 w-full text-on-surface-container-muted'>
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
        </div>
    )
}