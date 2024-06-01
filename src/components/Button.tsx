import { cn } from '../utils/tailwind'

type ButtonProps = {
    children: React.ReactNode,
    className?: string,
    href?: string,
    download?: string,
} & React.ButtonHTMLAttributes<HTMLButtonElement>

export default function Button({ children, className, href, download, ...rest }: ButtonProps) {
    const styling = `
        rounded-md text-sm font-semibold px-4 py-2 box-border
        grid place-content-center items-center grid-flow-col
        text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none
        bg-surface-container text-on-surface-container border border-outline hover:bg-surface-dim-container hover:text-on-surface-dim-container`;

    return (
        <>
            {
                href ?
                    <a
                        href={href}
                        download={download}
                        className={cn(styling, className)}>
                        {children}
                    </a> :
                    <button
                        {...rest}
                        className={cn(styling, className)}>
                        {children}
                    </button>
            }
        </>
    )
}