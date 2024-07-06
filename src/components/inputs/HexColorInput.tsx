import { hexToHsva, HsvaColor, hsvaToHex, hsvaToHexa } from '@uiw/react-color'
import { cn } from '../../utils/tailwind'
import { useEffect, useRef, useState } from 'react'
import { useCopyToClipboard } from 'usehooks-ts'
import Button from './Button'
import { MdCheck, MdContentPaste, MdOutlineContentCopy } from 'react-icons/md'

type HexColorInputProps = {
    className?: string,
    hexa?: boolean,
    customHexaPattern?: RegExp,
    color: HsvaColor,
    onColorChange: (newColor: HsvaColor) => void 
}

const HEXA_PATTERN = /^\s*#[a-fA-F0-9]{8}\s*$/;
const HEX_PATTERN = /^\s*#[a-fA-F0-9]{6}\s*$/;

export default function HexColorInput({ className, color, hexa, customHexaPattern, onColorChange }: HexColorInputProps) {
    const lastValidCustomAspectRatio = useRef<HsvaColor>();
    const colorPattern = hexa ? HEXA_PATTERN : HEX_PATTERN;
    const [input, setInput] = useState("#00000000");
    const [copied, setCopied] = useState(false);
    const [_, copy] = useCopyToClipboard();

    useEffect(() => {
        lastValidCustomAspectRatio.current = color;
        setInput(hexa || customHexaPattern?.test(hsvaToHexa(color)) ? hsvaToHexa(color) : hsvaToHex(color));
    }, [color, hexa]);

    async function copyToClipboard() {
        await copy(hexa ? hsvaToHexa(color) : hsvaToHex(color));
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }

    async function pasteFromClipboard() {
        const copiedText = await navigator.clipboard.readText();

        const newColor = customHexaPattern?.test(copiedText) || colorPattern.test(copiedText) ?
            hexToHsva(copiedText.trim()) :
            HEX_PATTERN.test(copiedText) ?
                { ...hexToHsva(copiedText.trim()), a: 1 } :
                undefined;

        if (newColor) {
            onColorChange(newColor);
        }
    }

    return (
        <div
            className={cn('flex gap-2', className)}>
            <input
                className='flex-1 w-full border border-outline rounded-md bg-surface-container text-on-surface-container disabled:text-on-surface-muted text-sm px-2 py-1.5'
                placeholder={hexa ? 'HEXA' : 'HEX'}
                value={input}
                onChange={(e) => {
                    const value = e.target.value;

                    if (customHexaPattern?.test(value) || colorPattern.test(value)) {
                        const newColor = hexToHsva(value.trim());
                        lastValidCustomAspectRatio.current = newColor;
                        onColorChange(newColor);
                    }

                    setInput(value);
                }}
                onBlur={(e) => lastValidCustomAspectRatio.current && onColorChange(lastValidCustomAspectRatio.current) } />

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