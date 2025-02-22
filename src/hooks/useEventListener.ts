import { useEffect, useLayoutEffect, useRef } from 'react'

export default function useEventListener<T extends keyof WindowEventMap>(
    eventName: T,
    handler: (event: WindowEventMap[T]) => void,
) {
    const savedHandler = useRef(handler);

    useLayoutEffect(() => {
        savedHandler.current = handler;
    }, [handler]);

    useEffect(() => {
        const controller = new AbortController();

        const listener: typeof handler = (event) => {
            savedHandler.current(event);
        };

        window.addEventListener(eventName, listener, { signal: controller.signal });

        return () => controller.abort();
    }, [eventName]);
}