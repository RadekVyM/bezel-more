export default function ComponentSwitch(props: {
    selectedKey: React.ReactNode,
    children: Array<React.ReactElement<any, string | React.JSXElementConstructor<any>>>
}) {
    return (
        <>{props.children.find((c) => c.key === props.selectedKey)}</>
    )
}