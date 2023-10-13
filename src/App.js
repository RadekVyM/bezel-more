import logo from './logo.svg'
import './App.css'
import { useEffect, useRef, useState } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

function App() {
    const ffmpegRef = useRef(new FFmpeg());
    const [ready, setReady] = useState(false);
    const [converting, setConverting] = useState(false);
    const [video, setVideo] = useState();
    const [gif, setGif] = useState('');
    const [gifSize, setGifSize] = useState(0);
    const [filterComplexConfig, setFilterComplexConfig] = useState({
        fps: 20,
        scale: 480,
        maxColors: 256,
        size: 480,
        length: 10
    });

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

    const convertToGif = async () => {
        setConverting(true);

        await ffmpegRef.current.writeFile('test.mp4', await fetchFile(video));

        await ffmpegRef.current.exec(
            ['-i', 'test.mp4', '-filter_complex',
            `fps=${filterComplexConfig.fps},scale=w=${filterComplexConfig.size}:h=${filterComplexConfig.size}:force_original_aspect_ratio=decrease:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=${filterComplexConfig.maxColors}[p];[s1][p]paletteuse=dither=bayer`,
            '-t', `${filterComplexConfig.length}`, '-ss', '0.0', '-f', 'gif', 'out.gif']);

        const data = await ffmpegRef.current.readFile('out.gif');
        const gifUrl = URL.createObjectURL(new Blob([data.buffer], { type: 'image/gif' }));

        setGif(gifUrl);
        setGifSize(data.byteLength);
        setConverting(false);
    }
  
    return ready ? (
        <main className='App'>
            <h1>bezel-more</h1>

            <Video
                style={{ margin: 'auto', width: 'fit-content' }}
                video={video}
                setVideo={setVideo}/>

            <FilterComplexConfigForm
                style={{ margin: '2rem auto', maxWidth: 'min(20rem, 90vw)' }}
                filterComplexConfig={filterComplexConfig}
                setFilterComplexConfig={setFilterComplexConfig}/>

            <button onClick={convertToGif} disabled={converting}>Convert</button>
            
            <h2>Result</h2>

            { !converting && gif && <Result gif={gif} gifSize={gifSize} />}
        </main>) :
        (<p>Loading...</p>)
}

function Video({ video, setVideo, style }) {
    return (
        <div
            style={{ ...style, display: 'flex', gap: '1rem', flexDirection: 'column' }}>
            {
                video &&
                <video
                    controls
                    width='250'
                    src={URL.createObjectURL(video)}>
                </video>
            }

            <input
                type='file'
                onChange={(e) => {
                    const item = e.target.files?.item(0);

                    if (item)
                        setVideo(item)
                }} />
        </div>
    )
}

function FilterComplexConfigForm({ filterComplexConfig, setFilterComplexConfig, style }) {
    return (
        <div
            style={{ ...style, display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '0.5rem' }}>
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
        </div>
    )
}

function NumberInput({ label, min, max, value, onChange, style }) {
    return (
        <div
            style={{ ...style, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ alignSelf: 'start' }}>{label}</label>
            <input
                type='number'
                min={min} max={max}
                value={value}
                onChange={onChange}/>
        </div>
    )
}

function Result({ gif, gifSize, style }) {

    return (
        <div
            style={{ ...style, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <img src={gif} width='250' />
            <span>{`${(gifSize / 1000000).toLocaleString(undefined, { style: 'unit', unit: 'megabyte', minimumFractionDigits: 2, maximumFractionDigits: 3 })}`}</span>
        </div>
    )
}

export default App;
