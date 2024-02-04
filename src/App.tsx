import './App.css'
import { useEffect, useRef, useState } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'
import VideoPreviewer from './components/VideoPreviewer'
import Loading from './components/Loading'
import useConversionConfig from './hooks/useConversionConfig'
import { ConversionProgress } from './types/ConversionProgress'
import ConvertDialog from './components/ConvertDialog'
import Button from './components/Button'
import SectionHeading from './components/SectionHeading'
import { getBezel } from './bezels'
import BezelSelection from './components/BezelSelection'
import { RiLoopLeftLine } from 'react-icons/ri'
import { BsPhone } from 'react-icons/bs'
import { useMediaQuery } from 'usehooks-ts'
import useContentDialog from './hooks/useContentDialog'
import { cn } from './utils/tailwind'
import ContentDialog from './components/ContentDialog'

export default function App() {
    const isLarge = useMediaQuery('(min-width: 60rem)');
    const [convertDialogRef, isConvertDialogOpen, convertDialogAnimation, showConvertDialog, hideConvertDialog] =
        useContentDialog(!isLarge);
    const [bezelDialogRef, isBezelDialogOpen, bezelDialogAnimation, showBezelDialog, hideBezelDialog] =
        useContentDialog(true);
    const ffmpegRef = useRef(new FFmpeg());
    const [ready, setReady] = useState(false);
    const [video, setVideo] = useState<File | null | undefined>(null);
    const [conversionConfig, updateConversionConfig] = useConversionConfig();
    const [progress, setProgress] = useState<ConversionProgress | null>(null);

    useEffect(() => {
        if (isConvertDialogOpen) {
            convertDialogRef.current?.scrollTo({ top: 0 })
        }
    }, [isConvertDialogOpen]);

    useEffect(() => {
        if (isBezelDialogOpen) {
            bezelDialogRef.current?.scrollTo({ top: 0 })
        }
    }, [isBezelDialogOpen]);

    useEffect(() => {
        loadFFmpeg();
    }, []);

    async function loadFFmpeg() {
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd'
        const ffmpeg = ffmpegRef.current;
        ffmpeg.on('log', ({ message }) => {
            console.log(message);
        });
        ffmpeg.on('progress', ({ progress, time }) => {
            console.log(`progress: ${progress} time: ${time}`);
            setProgress({ progress, time });
        });
        // toBlobURL is used to bypass CORS issue, urls with the same
        // domain can be used directly.
        await ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        setReady(true);
    }

    return ready ? (
        <main
            className={cn(
                'w-full h-full max-h-full mx-auto px-6 grid gap-x-5',
                isLarge ?
                    'grid-rows-[auto_1fr] grid-cols-[minmax(20rem,2fr)_3fr]' :
                    'grid-rows-[auto_1fr_auto] grid-cols-[1fr]'
            )}>
            <header
                className={cn(
                    'flex justify-between items-center pt-8 pb-10',
                    isLarge ?
                        'row-start-1 row-end-2 col-start-1 col-end-3' :
                        'row-start-1 row-end-2 col-start-1 col-end-2'
                )}>
                <PageHeading />

                {
                    isLarge &&
                    <Button
                        className='flex flex-row items-center gap-x-2'
                        onClick={() => showConvertDialog()}>
                        Convert
                        <RiLoopLeftLine className='w-4 h-4' />
                    </Button>
                }
            </header>

            {
                isLarge &&
                <div
                    className='h-full max-h-full overflow-auto thin-scrollbar pb-8 pr-2'>
                    <SectionHeading>Bezels</SectionHeading>
                    <BezelSelection
                        conversionConfig={conversionConfig}
                        updateConversionConfig={updateConversionConfig} />
                </div>
            }

            <VideoPreviewer
                video={video}
                setVideo={setVideo}
                bezel={getBezel(conversionConfig.bezelKey)}
                showBezel={conversionConfig.withBezel}
                onDurationLoad={(duration => updateConversionConfig({ start: 0, end: duration }))} />

            {
                !isLarge &&
                <div
                    className='flex mb-6 gap-x-3'>
                    <Button
                        className='flex flex-row items-center gap-x-2'
                        onClick={() => showBezelDialog()}>
                        Bezels
                        <BsPhone className='w-4 h-4' />
                    </Button>
                    <Button
                        className='flex flex-row items-center gap-x-2'
                        onClick={() => showConvertDialog()}>
                        Convert
                        <RiLoopLeftLine className='w-4 h-4' />
                    </Button>
                </div>
            }

            <ConvertDialog
                ref={convertDialogRef}
                hide={hideConvertDialog}
                animation={convertDialogAnimation}
                conversionConfig={conversionConfig}
                updateConversionConfig={updateConversionConfig}
                ffmpeg={ffmpegRef.current}
                video={video}
                progress={progress}
                resetProgress={() => setProgress(null)}
                slideInFromBottom={!isLarge} />

            {
                !isLarge &&
                <ContentDialog
                    ref={bezelDialogRef}
                    hide={hideBezelDialog}
                    animation={bezelDialogAnimation}
                    slideInFromBottom
                    heading={'Bezels'}>
                    <BezelSelection
                        conversionConfig={conversionConfig}
                        updateConversionConfig={updateConversionConfig} />
                </ContentDialog>
            }
        </main>) :
        (<main
            className='min-h-screen w-full grid place-content-center'>
            <Loading
                className='h-10 w-10 border-4' />
        </main>)
}

function PageHeading() {
    return (
        <h1 title='bezel-more' className='font-bold text-xl'>
            bezel<span aria-hidden className='line-through text-gray-400 dark:text-gray-600'>-less</span><span className='handwritten text-2xl'>-more</span>
        </h1>
    )
}