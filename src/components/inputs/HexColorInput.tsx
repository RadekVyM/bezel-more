import { hexToHsva, HsvaColor, hsvaToHex, hsvaToHexa } from '@uiw/react-color'
import { cn } from '../../utils/tailwind'
import { useEffect, useRef, useState } from 'react'
import { useCopyToClipboard } from 'usehooks-ts'
import Button from './Button'
import { MdCheck, MdContentPaste, MdOutlineContentCopy } from 'react-icons/md'

const HEXA_PATTERN = /^\s*#[a-fA-F0-9]{8}\s*$/;
const HEX_PATTERN = /^\s*#[a-fA-F0-9]{6}\s*$/;

export default function HexColorInput(props: {
    className?: string,
    hexa?: boolean,
    customHexaPattern?: RegExp,
    color: HsvaColor,
    onColorChange: (newColor: HsvaColor) => void 
}) {
    const lastValidCustomAspectRatio = useRef<HsvaColor>();
    const colorPattern = props.hexa ? HEXA_PATTERN : HEX_PATTERN;
    const [input, setInput] = useState("#00000000");
    const [copied, setCopied] = useState(false);
    const [_, copy] = useCopyToClipboard();

    useEffect(() => {
        lastValidCustomAspectRatio.current = props.color;
        const inputValue = props.hexa || props.customHexaPattern?.test(hsvaToHexa(props.color)) ?
            hsvaToHexa(props.color) :
            hsvaToHex(props.color);
        setInput(inputValue);
    }, [props.color, props.hexa]);

    async function copyToClipboard() {
        await copy(props.hexa ? hsvaToHexa(props.color) : hsvaToHex(props.color));
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }

    async function pasteFromClipboard() {
        const copiedText = await navigator.clipboard.readText();

        const newColor = props.customHexaPattern?.test(copiedText) || colorPattern.test(copiedText) ?
            hexToHsva(copiedText.trim()) :
            HEX_PATTERN.test(copiedText) ?
                { ...hexToHsva(copiedText.trim()), a: 1 } :
                undefined;

        if (newColor) {
            props.onColorChange(newColor);
        }
    }

    return (
        <div
            className={cn('flex gap-2', props.className)}>
            <input
                className='flex-1 w-full border border-outline rounded-md bg-surface-container text-on-surface-container disabled:text-on-surface-muted text-sm px-2 py-1.5'
                placeholder={props.hexa ? 'HEXA' : 'HEX'}
                value={input}
                onChange={(e) => {
                    const value = e.target.value;

                    if (props.customHexaPattern?.test(value) || colorPattern.test(value)) {
                        const newColor = hexToHsva(value.trim());
                        lastValidCustomAspectRatio.current = newColor;
                        props.onColorChange(newColor);
                    }

                    setInput(value);
                }}
                onBlur={() => lastValidCustomAspectRatio.current && props.onColorChange(lastValidCustomAspectRatio.current) } />

            <Button
                title='Copy'
                className='py-1 px-2 aspect-square'
                onClick={copyToClipboard}>
                {copied ?
                    <MdCheck
                        className='w-4 h-4'/> :
                    <MdOutlineContentCopy
                        className='w-4 h-4'/>}
            </Button>

            <Button
                title='Paste'
                className='py-1 px-2 aspect-square'
                onClick={pasteFromClipboard}>
                <MdContentPaste
                    className='w-4 h-4'/>
            </Button>
        </div>
    )
}