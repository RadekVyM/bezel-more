import { useLayoutEffect, useState } from 'react'

export default function useMediaQuery(query: string) {
    const [isMatch, setIsMatch] = useState<boolean>(false);

    useLayoutEffect(() => {
        const matchMedia = window.matchMedia(query);
    
        onChange();
    
        matchMedia.addEventListener('change', onChange);
    
        return () => matchMedia.removeEventListener('change', onChange);

        function onChange() {
            const isMatch = window.matchMedia(query).matches;
            setIsMatch(isMatch);
        }
    }, [query]);

    return isMatch;
}