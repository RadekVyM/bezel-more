import { useMemo } from 'react'
import { MdOutlineUploadFile } from 'react-icons/md'
import ContentContainer from './ContentContainer'

export default function VideoLoader({ video, setVideo, onDurationLoad }) {
    const withVideo = !!video;

    return (
        <div
            className={`grid gap-6 ${withVideo ? 'grid-rows-[1fr,auto]' : ''}`}>
            {
                withVideo && <Video video={video} onDurationLoad={onDurationLoad}/>
            }

            <div
                className={withVideo ?
                    '' :
                    'grid h-[37rem]'}>
                {
                    !withVideo &&
                    <ContentContainer
                        className='dropzone-file-area row-start-1 row-end-2 col-start-1 col-end-2
                            flex flex-col items-center justify-center
                            pt-5 pb-6 w-full cursor-pointer'>
                        <MdOutlineUploadFile
                            className='w-8 h-8 mb-4 text-gray-500 dark:text-gray-400'/>
                        <p
                            className='mb-2 text-sm text-gray-500 dark:text-gray-400'>
                            <span className='font-semibold'>Click to upload</span> or drag and drop
                        </p>
                    </ContentContainer>
                }
                <input
                    type='file'
                    className={withVideo ?
                        `block w-full text-sm text-gray-600 dark:text-gray-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:cursor-pointer
                        file:bg-black file:text-white dark:file:bg-gray-50 dark:file:text-black
                        hover:file:bg-gray-800 dark:hover:file:bg-gray-200` :
                        'dropzone-file-input row-start-1 row-end-2 col-start-1 col-end-2 rounded-lg opacity-0 cursor-pointer'}
                    onChange={(e) => {
                        const item = e.target.files?.item(0);
    
                        if (item) {
                            setVideo(item);
                        }
                    }}/>
            </div>
        </div>
    )
}

function Video({ video, onDurationLoad }) {
    const url = useMemo(() => URL.createObjectURL(video), [video]);

    return (
        <ContentContainer
            className='h-[37rem] row-start-1 row-end-2 w-full'>
            <video
                preload='metadata'
                onLoadedMetadata={((e) => onDurationLoad && onDurationLoad(e.target.duration))}
                className='rounded-lg h-full w-full'
                controls loop autoPlay
                src={url}>
            </video>
        </ContentContainer>
    )
}