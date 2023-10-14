import logo from './logo.svg'
import './App.css'
import { useEffect, useRef, useState } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'
import { bezels } from './bezels'
import { convertToGif } from './services/video/gif'
import NumberInput from './components/NumberInput'

export default function App() {
    const ffmpegRef = useRef(new FFmpeg());
    const [ready, setReady] = useState(false);
    const [converting, setConverting] = useState(false);
    const [video, setVideo] = useState();
    const [gif, setGif] = useState('');
    const [gifSize, setGifSize] = useState(0);
    const [filterComplexConfig, setFilterComplexConfig] = useState({
        fps: 20,
        scale: 480,
        maxColors: 255,
        size: 480,
        length: 10
    });
    const [bezelKey, setBezelKey] = useState(bezels.iphone.key);

    async function loadFFmpeg() {
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd'
        const ffmpeg = ffmpegRef.current;
        ffmpeg.on('log', ({ message }) => {
            console.log(message);
        });
        ffmpeg.on('progress', ({ progress, time }) => {
            console.log(`progress: ${progress} time: ${time}`);
        });
        // toBlobURL is used to bypass CORS issue, urls with the same
        // domain can be used directly.
        await ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        setReady(true);
    }

    useEffect(() => {
        loadFFmpeg();
    }, []);

    async function convert () {
        setConverting(true);

        const bezel = Object.values(bezels).filter((b) => b.key == bezelKey)[0];

        const data = await convertToGif(ffmpegRef.current, video, bezel, filterComplexConfig);
        const gifUrl = URL.createObjectURL(new Blob([data.buffer], { type: 'image/gif' }));

        setGif(gifUrl);
        setGifSize(data.byteLength);
        setConverting(false);
    }
  
    return ready ? (
        <main
            className='min-h-screen max-w-screen-xl w-full mx-auto px-4'>
            <h1 className='font-bold text-xl mt-4 mb-14'>bezel-<span className='line-through text-gray-400 dark:text-gray-700'>less</span>-more</h1>

            <div
                className='grid grid-cols-[1fr,auto,1fr] items-stretch'>
                <div
                    className=''>
                    <h2 className='font-bold text-3xl mb-4'>Input</h2>

                    <Video
                        video={video}
                        setVideo={setVideo}/>
                </div>

                <button
                    className='self-center m-5 rounded-md font-semibold bg-black text-white hover:bg-gray-800 px-4 py-2'
                    onClick={convert}
                    disabled={converting || !video}>
                    Convert
                </button>
                
                <div
                    className=''>
                    <h2 className='font-bold text-3xl mb-4'>Output</h2>

                    <Result gif={gif} gifSize={gifSize} />
                </div>
            </div>

            <FilterComplexConfigForm
                filterComplexConfig={filterComplexConfig}
                setFilterComplexConfig={setFilterComplexConfig}
                bezel={bezelKey}
                setBezel={setBezelKey}/>
        </main>) :
        (<p>Loading...</p>)
}

function Video({ video, setVideo }) {
    const withVideo = !!video;

    return (
        <div
            className={`h-[40rem] grid ${withVideo ? 'grid-rows-[1fr,auto]' : ''}`}>
            {
                withVideo &&
                <div
                    className='h-[37rem] row-start-1 row-end-2 w-full border-2 border-gray-300 border-dashed rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600'>
                    <video
                        className='rounded-lg h-full w-full'
                        controls
                        src={URL.createObjectURL(video)}>
                    </video>
                </div>
            }

            <label
                for='dropzone-file'
                className={withVideo ?
                    '' :
                    'flex flex-col items-center justify-center w-full h-[37rem] border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600'}>
                {
                    !withVideo &&
                    <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                        <svg className='w-8 h-8 mb-4 text-gray-500 dark:text-gray-400' aria-hidden='true' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 16'>
                            <path stroke='currentColor' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2'/>
                        </svg>
                        <p className='mb-2 text-sm text-gray-500 dark:text-gray-400'><span className='font-semibold'>Click to upload</span> or drag and drop</p>
                    </div>
                }
                <input
                    id='dropzone-file'
                    type='file'
                    className={withVideo ?
                        `block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-black file:text-white
                        hover:file:bg-gray-800` :
                        'hidden'}
                    onChange={(e) => {
                        const item = e.target.files?.item(0);
    
                        if (item)
                            setVideo(item)
                    }}/>
            </label>
        </div>
    )
}

function FilterComplexConfigForm({ filterComplexConfig, setFilterComplexConfig, bezel, setBezel, style }) {
    return (
        <div
            className='row g-2'>
            <NumberInput
                label='FPS'
                min={5} max={60}
                value={filterComplexConfig.fps}
                onChange={(e) => setFilterComplexConfig((old) => ({ ...old, fps: e.target.value }))}/>
            <NumberInput
                label='Max Colors'
                min={32}
                value={filterComplexConfig.maxColors}
                onChange={(e) => setFilterComplexConfig((old) => ({ ...old, maxColors: e.target.value }))}/>
            <NumberInput
                label='Length'
                min={1}
                value={filterComplexConfig.length}
                onChange={(e) => setFilterComplexConfig((old) => ({ ...old, length: e.target.value }))}/>
            <NumberInput
                label='Size'
                min={1}
                value={filterComplexConfig.size}
                onChange={(e) => setFilterComplexConfig((old) => ({ ...old, size: e.target.value }))}/>

            <fieldset>
                <legend>Bezel:</legend>

                {Object.values(bezels).map(b =>
                    <div
                        key={b.key}
                        className='form-check'>
                        <input
                            className='h-4 w-4 border-gray-300 text-black focus:ring-black'
                            type='radio'
                            name='bezel'
                            id={b.key}
                            value={b.key}
                            checked={bezel === b.key}
                            onChange={(e) => setBezel(e.currentTarget.value)}/>
                        <label
                            className='form-check-label'
                            htmlFor={b.key}>
                            {b.title}
                        </label>
                    </div>)}
            </fieldset>
        </div>
    )
}

function Result({ gif, gifSize }) {
    return (
        <div>
            <div
                className='flex items-center p-5 w-full h-[37rem] border-2 border-gray-300 border-dashed rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600'>
                <img className='max-h-full m-auto' src={gif} />
            </div>
            <span>{`${(gifSize / 1000000).toLocaleString(undefined, { style: 'unit', unit: 'megabyte', minimumFractionDigits: 2, maximumFractionDigits: 3 })}`}</span>
        </div>
    )
}