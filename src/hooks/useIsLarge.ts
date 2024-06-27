import { useMediaQuery } from 'usehooks-ts'

export default function useIsLarge() {
    return useMediaQuery('(min-width: 60rem)');
}