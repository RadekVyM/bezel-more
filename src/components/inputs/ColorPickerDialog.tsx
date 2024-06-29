import { forwardRef } from 'react'
import { Dialog, DialogProps } from '../Dialog'
import { cn } from '../../utils/tailwind'
import SectionHeading from '../SectionHeading'
import Button from './Button'
import { MdClose } from 'react-icons/md'
import { Alpha, HsvaColor, Hue, Saturation, hsvaToHexa } from '@uiw/react-color'

type ColorPickerDialogProps = {
    color: HsvaColor,
    onPick: (color: HsvaColor) => void,
    hide: () => void,
} & DialogProps

export const ColorPickerDialog = forwardRef<HTMLDialogElement, ColorPickerDialogProps>(({ color, animation, className, hide, onPick }, ref) => {
    return (
        <Dialog
            ref={ref}
            animation={animation}
            className={cn(className, 'px-6 pb-6 rounded-lg')}>
            <article
                className='isolate flex flex-col'>
                <header
                    className='flex justify-between items-start pt-8'>
                    <SectionHeading>Color</SectionHeading>
                    <Button
                        className='p-1'
                        onClick={() => hide()}>
                        <MdClose className='w-5 h-5' />
                    </Button>
                </header>

                <div
                    className='grid grid-cols-[auto_auto_auto] gap-3'>
                    <Saturation
                        style={{ borderRadius: '0.4rem' }}
                        hsva={color}
                        onChange={onPick} />
                    
                    <Hue
                        height='200px'
                        width='16px'
                        radius='0.4rem'
                        direction='vertical'
                        hue={color.h}
                        onChange={(newHue) => onPick({ ...color, ...newHue })} />

                    <Alpha
                        hsva={color}
                        height='200px'
                        width='16px'
                        radius='0.4rem'
                        direction='vertical'
                        onChange={(newAplha) => onPick({ ...color, ...newAplha })} />

                    <div
                        className='checkered col-start-1 col-end-4 h-8 rounded-[0.4rem] overflow-hidden'>
                        <div
                            style={{ background: hsvaToHexa(color) }}
                            className='col-start-1 col-end-4 h-full w-full' />
                    </div>
                </div>
            </article>
        </Dialog>
    )
});