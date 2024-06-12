import { forwardRef, useState } from 'react'
import { Dialog, DialogProps } from '../Dialog'
import { cn } from '../../utils/tailwind'
import SectionHeading from '../SectionHeading'
import Button from './Button'
import { MdClose } from 'react-icons/md'
import { HsvaColor, Hue, Saturation, hsvaToHexa } from '@uiw/react-color'

type ColorPickerDialogProps = {
    onPicked: (hexaColor: string) => void,
    hide: () => void,
} & DialogProps

export const ColorPickerDialog = forwardRef<HTMLDialogElement, ColorPickerDialogProps>(({ animation, className, hide, onPicked }, ref) => {
    const [hsvaColor, setHsvaColor] = useState<HsvaColor>({ h: 0, s: 0, v: 0, a: 1 });

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
                    className='grid grid-cols-[auto_auto] gap-3 mb-3'>
                    <Saturation
                        style={{ borderRadius: '0.4rem' }}
                        hsva={hsvaColor}
                        onChange={(newColor) => setHsvaColor(newColor)}/>
                    
                    <Hue
                        height='200px'
                        width='16px'
                        radius='0.4rem'
                        direction='vertical'
                        hue={hsvaColor.h}
                        onChange={(newHue) => setHsvaColor((old) => ({ ...old, ...newHue }))}/>

                    <div
                        style={{ background: hsvaToHexa(hsvaColor) }}
                        className='col-start-1 col-end-3 h-8 rounded-[0.4rem]'/>
                </div>

                <Button
                    onClick={() => {
                        onPicked(hsvaToHexa(hsvaColor));
                        hide();
                    }}>
                    Pick
                </Button>
            </article>
        </Dialog>
    )
});