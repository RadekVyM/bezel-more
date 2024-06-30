import { cn } from '../utils/tailwind'

type OutlinedTextProps = {
    children: React.ReactNode,
    className?: string,
    outlineClassName?: string,
    fillClassName?: string,
} & React.SVGTextElementAttributes<SVGTextElement>

export default function OutlinedText({ children, className, outlineClassName, fillClassName, ...rest }: OutlinedTextProps) {
    return (
        <g>
            <text
                className={cn(className, outlineClassName)}
                strokeLinecap='round'
                strokeLinejoin='round'
                {...rest}>
                {children}
            </text>
            <text
                className={cn(className, fillClassName)}
                strokeLinecap='round'
                strokeLinejoin='round'
                {...rest}
                strokeWidth={0}>
                {children}
            </text>
        </g>
    )
}