import { useRef } from 'react'
import Button from './Button'
import { LuFileVideo } from 'react-icons/lu'

type FileSelectionProps = {
    video: File | null | undefined,
    setVideo: (video: File | null | undefined) => void,
}

export default function FileSelection({ video, setVideo }: FileSelectionProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <>
            <Button
                className='flex gap-2 items-center px-3 py-1.5'
                onClick={() => inputRef.current?.click()}>
                <LuFileVideo
                    className='w-4 h-4'/>
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