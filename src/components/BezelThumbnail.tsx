import { bezelMask, bezelSmallImage } from '../bezels'
import { cn } from '../utils/tailwind'

type BezelThumbnailProps = {
    bezelKey: string,
    modelKey: string,
    bezelTitle?: string,
    className?: string
}

export default function BezelThumbnail({ bezelKey, modelKey, bezelTitle, className }: BezelThumbnailProps) {
    return (
        <div
            className={cn('grid grid-rows-1 grid-cols-1 isolate', className)}>
            <div
                className='row-start-1 row-end-2 col-start-1 col-end-2 justify-self-center self-center
                w-full h-full
                bg-[linear-gradient(0deg,var(--secondary)_0%,var(--primary)_100%)]'
                style={{
                    maskImage: `url('${bezelMask(modelKey)}')`,
                    WebkitMaskImage: `url('${bezelMask(modelKey)}')`,
                    maskRepeat: 'no-repeat',
                    maskPosition: 'center',
                    maskSize: 'contain',
                    maskMode: 'luminance'
                }} />
            <img
                className='row-start-1 row-end-2 col-start-1 col-end-2 justify-self-center self-center max-h-full max-w-full z-10'
                loading='lazy'
                src={bezelSmallImage(bezelKey)}
                alt={`${bezelTitle} Bezel`} />
        </div>
    )
}