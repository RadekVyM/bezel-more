import { useRef } from 'react'
import Button from './Button'
import { FaRegFileVideo } from 'react-icons/fa'

type FileSelectionProps = {
    video: File | null | undefined,
    setVideo: (video: File | null | undefined) => void,
}

export default function FileSelection({ video, setVideo }: FileSelectionProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <>
            <Button
                className='flex gap-3 items-center px-3 py-1.5'
                onClick={() => inputRef.current?.click()}>
                <FaRegFileVideo
                    className='w-3 h-4'/>
                {video?.name || 'Choose file'}
            </Button>

            <input
                ref={inputRef}
                type='file'
                accept='video/*'
                className='hidden'
                onChange={(e) => {
                    const item = e.target.files?.item(0);

                    if (item) {
                        setVideo(item);
                    }
                }} />
        </>
    )
}