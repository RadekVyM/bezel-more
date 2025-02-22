import useMediaQuery from './useMediaQuery'

export default function useIsLarge() {
    return useMediaQuery('(min-width: 60rem)');
}