type ComponentSwitchProps = {
    selectedKey: React.ReactNode,
    children: Array<React.ReactElement<any, string | React.JSXElementConstructor<any>>>
}

export default function ComponentSwitch({ selectedKey, children }: ComponentSwitchProps) {
    return (
        <>{children.find((c) => c.key === selectedKey)}</>
    )
}