import { RefObject, useEffect, useState } from 'react'

export default function useDimensions(ref: RefObject<Element | null>) {
    const [dimensions, setDimensions] = useState({
        width: 0,
        height: 0
    });

    useEffect(() => {
        if (!ref.current) {
            return;
        }

        const observeTarget = ref.current;
        const resizeObserver = new ResizeObserver(entries => {
            entries.forEach(entry => {
                setDimensions(entry.contentRect);
            });
        });
        resizeObserver.observe(observeTarget);
        return () => resizeObserver.unobserve(observeTarget);
    }, [ref]);

    return dimensions;
}