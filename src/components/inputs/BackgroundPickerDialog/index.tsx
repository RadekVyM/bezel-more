import { forwardRef, useEffect, useRef } from 'react'
import { Dialog, DialogProps } from '../../Dialog'
import { cn } from '../../../utils/tailwind'
import SectionHeading from '../../SectionHeading'
import Button from '../Button'
import { MdClose } from 'react-icons/md'
import { Background, BackgroundType, ImageBackground, LinearGradientBackground, RadialGradientBackground, SolidBackground, createImageBackground, createLinearGradientBackground, createRadialGradientBackground, createSolidBackground } from '../../../types/Background'
import SolidColorPicker from './SolidColorPicker'
import Tabs from '../../Tabs'
import ComponentSwitch from '../../ComponentSwitch'
import { hexToHsva } from '@uiw/react-color'
import LinearGradientPicker from './LinearGradientPicker'
import RadialGradientPicker from './RadialGradientPicker'
import ImagePicker from './ImagePicker'

type BackgroundPickerDialogProps = {
    currentBackground: Background,
    onPick: (background: Background) => void,
} & DialogProps

const DEFAULT_BACKGROUNDS: Array<[BackgroundType, Background]> = [
    ['solid', createSolidBackground(hexToHsva('#00000000'))],
    ['linear-gradient', createLinearGradientBackground(hexToHsva('#ffffffff'), hexToHsva('#ffffffff'), 0)],
    ['radial-gradient', createRadialGradientBackground(hexToHsva('#ffffffff'), hexToHsva('#ffffffff'), 0)],
    ['image', createImageBackground('', true)],
];

const BackgroundPickerDialog = forwardRef<HTMLDialogElement, BackgroundPickerDialogProps>(({ currentBackground, state, className, onPick }, ref) => {
    const defaultBackgroundsRef = useRef<Map<BackgroundType, Background>>(new Map(DEFAULT_BACKGROUNDS));

    useEffect(() => {
        defaultBackgroundsRef.current.set(currentBackground.type, currentBackground);
    }, [currentBackground]);

    return (
        <Dialog
            ref={ref}
            state={state}
            className={cn(className, 'px-6 pb-6 rounded-lg sm:max-w-lg w-full')}>
            <article
                className='isolate flex flex-col'>
                <header
                    className='flex justify-between items-start pt-8'>
                    <SectionHeading>Background</SectionHeading>
                    <Button
                        className='p-1'
                        onClick={state.hide}>
                        <MdClose className='w-5 h-5' />
                    </Button>
                </header>

                <Tabs
                    className='mb-5'
                    variant='sm'
                    selectedTabKey={currentBackground.type}
                    tabs={[
                        { key: 'solid', title: 'Solid', onClick: () => onPick(defaultBackgroundsRef.current.get('solid')!) },
                        { key: 'linear-gradient', title: 'Linear', onClick: () => onPick(defaultBackgroundsRef.current.get('linear-gradient')!) },
                        { key: 'radial-gradient', title: 'Radial', onClick: () => onPick(defaultBackgroundsRef.current.get('radial-gradient')!) },
                        { key: 'image', title: 'Image', onClick: () => onPick(defaultBackgroundsRef.current.get('image')!) },
                    ]}/>
                
                <ComponentSwitch
                    selectedKey={currentBackground.type}>
                    <SolidColorPicker
                        key='solid'
                        currentBackground={currentBackground as SolidBackground}
                        onPick={onPick} />
                    <LinearGradientPicker
                        key='linear-gradient'
                        currentBackground={currentBackground as LinearGradientBackground}
                        onPick={onPick} />
                    <RadialGradientPicker
                        key='radial-gradient'
                        currentBackground={currentBackground as RadialGradientBackground}
                        onPick={onPick} />
                    <ImagePicker
                        key='image'
                        currentBackground={currentBackground as ImageBackground}
                        onPick={onPick} />
                </ComponentSwitch>
            </article>
        </Dialog>
    )
});

BackgroundPickerDialog.displayName = 'BackgroundPickerDialog';

export default BackgroundPickerDialog;