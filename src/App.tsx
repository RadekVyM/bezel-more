import './App.css'
import { useEffect, useRef, useState } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'
import VideoPreviewer from './components/VideoPreviewer'
import ConversionConfiguration from './components/ConversionConfiguration'
import Loading from './components/Loading'
import useConversionConfig from './hooks/useConversionConfig'
import { ConversionProgress } from './types/ConversionProgress'
import ConvertDialog from './components/ConvertDialog'
import Button from './components/Button'
import useDialog from './hooks/useDialog'
import SectionHeading from './components/SectionHeading'
import { BEZELS, getBezel } from './bezels'
import BezelSelection from './components/BezelSelection'

export default function App() {
    const [convertDialogRef, isConvertDialogOpen, convertDialogAnimation, showConvertDialog, hideConvertDialog] =
        useDialog('backdrop:animate-fadeIn animate-slideLeftIn', 'backdrop:animate-fadeOut animate-slideRightOut');
    const ffmpegRef = useRef(new FFmpeg());
    const [ready, setReady] = useState(false);
    const [video, setVideo] = useState<File | null | undefined>(null);
    const [conversionConfig, updateConversionConfig] = useConversionConfig();
    const [progress, setProgress] = useState<ConversionProgress | null>(null);

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
            className='w-full h-full max-h-full mx-auto px-6 grid grid-rows-[auto_1fr] grid-cols-[minmax(20rem,2fr)_3fr] gap-x-5'>
            <header
                className='row-start-1 row-end-2 col-start-1 col-end-3 flex justify-between items-center pt-8 pb-10'>
                <PageHeading />

                <Button
                    onClick={() => showConvertDialog()}>
                    Convert
                </Button>
            </header>

            <div
                className='h-full max-h-full overflow-auto thin-scrollbar pb-8 pr-2'>
                <SectionHeading>Bezels</SectionHeading>
                <BezelSelection
                    conversionConfig={conversionConfig}
                    updateConversionConfig={updateConversionConfig} />
            </div>

            <VideoPreviewer
                video={video}
                setVideo={setVideo}
                bezel={getBezel(conversionConfig.bezelKey)}
                showBezel={conversionConfig.withBezel}
                onDurationLoad={(duration => updateConversionConfig({ start: 0, end: duration }))} />

            <ConvertDialog
                ref={convertDialogRef}
                hide={hideConvertDialog}
                animation={convertDialogAnimation}
                conversionConfig={conversionConfig}
                updateConversionConfig={updateConversionConfig}
                ffmpeg={ffmpegRef.current}
                video={video}
                progress={progress}
                resetProgress={() => setProgress(null)} />
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