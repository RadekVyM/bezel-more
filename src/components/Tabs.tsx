import { cn } from '../utils/tailwind'
import Button from './Button'
import Container from './Container'

type Tab = {
    key: string,
    title: React.ReactNode,
    icon?: React.ReactNode,
    onClick?: (tab: Tab) => void
}

type TabsProps = {
    tabs: Array<Tab>
    selectedTabKey: string,
    isVertical?: boolean
    className?: string
}

export default function Tabs({ className, tabs, isVertical, selectedTabKey }: TabsProps) {
    return (
        <Container
            className={cn('flex gap-3 py-2', isVertical ? 'flex-col px-2' : 'px-3', className)}>
            {tabs.map((tab) =>
            <Button
                className={cn('flex flex-row items-center justify-center', isVertical ? 'flex-col px-3 pt-2 pb-1 gap-1 text-xs' : 'flex-1 gap-2')}
                onClick={() => tab.onClick && tab.onClick(tab)}>
                {tab.icon}
                {tab.title}
            </Button>)}
        </Container>
    )
}