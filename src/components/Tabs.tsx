import { cn } from '../utils/tailwind'
import Button from './inputs/Button'

type Tab = {
    key: string,
    title: React.ReactNode,
    icon?: React.ReactNode,
    onClick?: (tab: Tab) => void
}

type TabsProps = {
    tabs: Array<Tab>
    selectedTabKey: string,
    isVertical?: boolean,
    variant?: TabsVariant,
    className?: string
}

type TabsVariant = 'default' | 'sm'

export default function Tabs({ className, tabs, isVertical, selectedTabKey, variant }: TabsProps) {
    variant = variant || 'default';

    return (
        <div
            className={cn('flex gap-3', isVertical && 'flex-col', className)}>
            {tabs.map((tab) =>
            <Button
                key={tab.key}
                className={cn(
                    'relative flex flex-row items-center justify-center',
                    'select-none',
                    isVertical ?
                        'flex-col px-3 pt-2 pb-1 gap-1 text-xs' :
                        'flex-1',
                    variant === 'default' && !isVertical && 'gap-3 py-4',
                    variant === 'sm' && !isVertical && 'gap-1 py-2',
                    selectedTabKey !== tab.key && 'after:hidden text-on-surface-container-muted',
                    'after:content-[""] after:absolute after:w-full after:h-1 after:rounded after:bg-on-surface-container after:bottom-0',
                    variant === 'default' && 'after:max-w-12',
                    variant === 'sm' && 'after:max-w-8'
                )}
                onClick={() => tab.onClick && tab.onClick(tab)}>
                {tab.icon}
                {tab.title}
            </Button>)}
        </div>
    )
}