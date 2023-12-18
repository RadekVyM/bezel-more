import './App.css'
import { useEffect, useRef, useState } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'
import { BEZELS } from './bezels'
import { supportedFormats } from './supportedFormats'
import { convertToGifWithBezel, convertToGif } from './services/video/gif'
import { convertToWebpWithBezel, convertToWebp } from './services/video/webp'
import Button from './components/Button'
import VideoLoader from './components/VideoLoader'
import ConversionConfiguration from './components/ConversionConfiguration'
import ContentContainer from './components/ContentContainer'
import Loading from './components/Loading'
import { MdOutlineVideoLibrary, MdEast } from 'react-icons/md'
import { cn } from './utils/tailwind'
import useConversionConfig from './hooks/useConversionConfig'

export default function App() {
    const ffmpegRef = useRef(new FFmpeg());
    const [ready, setReady] = useState(false);
    const [converting, setConverting] = useState(false);
    const [video, setVideo] = useState(null);
    const [result, setResult] = useState(null);
    const [resultSize, setResultSize] = useState(0);
    const [conversionConfig, updateConversionConfig] = useConversionConfig();
    const [progress, setProgress] = useState(null);

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

    async function convert() {
        setConverting(true);
        setResult(null);

        const bezel = Object.values(BEZELS).filter((b) => b.key === conversionConfig.bezelKey)[0];
        const format = Object.values(supportedFormats).filter((f) => f.key === conversionConfig.formatKey)[0];

        const convertWithBezel = getConvertWithBezel(conversionConfig.formatKey);
        const convertWithoutBezel = getConvertWithoutBezel(conversionConfig.formatKey);

        try {
            const data = conversionConfig.withBezel ?
                await convertWithBezel(ffmpegRef.current, video, bezel, conversionConfig) :
                await convertWithoutBezel(ffmpegRef.current, video, conversionConfig);
            const resultUrl = URL.createObjectURL(new Blob([data.buffer], { type: format.type }));

            setResult(resultUrl);
            setResultSize(data.byteLength);
        }
        catch(error) {
            // TODO: Display an error message
            console.error(error);

            setResult(null);
            setResultSize(0);
        }
        
        setProgress(null);
        setConverting(false);
    }
  
    return ready ? (
        <main
            className='min-h-screen max-w-screen-xl w-full mx-auto px-4 pb-12'>
            <PageHeading/>

            <div
                className='grid grid-rows-[1fr,auto,1fr] grid-cols-[1fr] sm:grid-rows-[1fr] sm:grid-cols-[1fr,auto,1fr] justify-items-stretch sm:items-stretch mb-10'>
                <div>
                    <SectionHeading>Input</SectionHeading>

                    <VideoLoader
                        video={video}
                        setVideo={setVideo}
                        onDurationLoad={(duration => updateConversionConfig({ start: 0, end: duration }))}/>
                </div>

                <Button
                    className='self-center justify-self-center m-6 flex items-center'
                    onClick={convert}
                    disabled={converting || !video}>
                    <span className='mr-2'>Convert</span>
                    {
                        !converting ?
                            <MdEast className='inline-block w-4 h-4'/> :
                            <Loading/>
                    }
                </Button>
                
                <div>
                    <SectionHeading>Output</SectionHeading>

                    <Result
                        gif={result}
                        gifSize={resultSize}
                        progress={progress}/>
                </div>
            </div>

            <SectionHeading>Configuration</SectionHeading>

            <ConversionConfiguration
                conversionConfig={conversionConfig}
                updateConversionConfig={updateConversionConfig} />
        </main>) :
        (<main
            className='min-h-screen w-full grid place-content-center'>
            <Loading
                className='h-10 w-10 border-4'/>
        </main>)
}

function PageHeading() {
    return (
        <h1 title='bezel-more' className='font-bold text-xl mt-4 mb-14'>
            bezel<span aria-hidden className='line-through text-gray-400 dark:text-gray-600'>-less</span><span className='handwritten text-2xl'>-more</span>
        </h1>
    )
}

function SectionHeading({ children, className }) {
    return (
        <h2 className={cn('font-bold text-3xl mb-4', className)}>{children}</h2>
    )
}

function Result({ gif, gifSize, progress }) {
    return (
        <div
            className='flex flex-col gap-6'>
            <ContentContainer
                className='flex items-center p-5 w-full h-[37rem]'>
                {
                    gif ?
                        <img className='max-h-full m-auto' src={gif} alt='Result' /> :
                        <div
                            className='flex flex-col items-center justify-center pt-5 pb-6 w-full text-gray-500 dark:text-gray-400'>
                            <MdOutlineVideoLibrary
                                className='w-8 h-8 mb-4'/>
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
                    href={gif}
                    download={gif}
                    disabled={!gif}>
                    Download
                </Button>
                <span className='text-sm text-gray-600 dark:text-gray-400'>
                    {`${(gifSize / 1000000).toLocaleString(undefined, { style: 'unit', unit: 'megabyte', minimumFractionDigits: 2, maximumFractionDigits: 3 })}`}
                </span>
            </div>
        </div>
    )
}

function getConvertWithBezel(format) {
    switch (format) {
        case supportedFormats.gif.key:
            return convertToGifWithBezel;
        case supportedFormats.webp.key:
            return convertToWebpWithBezel;
    }
}

function getConvertWithoutBezel(format) {
    switch (format) {
        case supportedFormats.gif.key:
            return convertToGif;
        case supportedFormats.webp.key:
            return convertToWebp;
    }
}