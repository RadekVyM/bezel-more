type FilterParams = {
    input: string[],
    output?: string[]
}

type TpadFilterParams = {
    startPadDuration: number,
    endPadDuration: number
} & FilterParams

type ScaleFilterParams = {
    width: number,
    height: number
} & FilterParams

type PadFilterParams = {
    width: number,
    height: number
} & FilterParams

type FpsFilterParams = {
    fps: number
} & FilterParams

type PalettegenFilterParams = {
    maxColors: number
} & FilterParams

export function compose(...filters: string[]) {
    return filters.join(';')
}

export function tpad(params: TpadFilterParams) {
    const startPad = `start_mode=clone:start_duration=${params.startPadDuration}`;
    const endPad = `stop_mode=clone:stop_duration=${params.endPadDuration}`;

    return composeFilter(
        params,
        `tpad=${startPad}:${endPad},setpts=PTS-STARTPTS`
    );
}

export function scale(params: ScaleFilterParams) {
    return composeFilter(
        params,
        `scale=w=${params.width}:h=${params.height}:force_original_aspect_ratio=decrease:flags=lanczos`
    )
}

export function pad(params: PadFilterParams) {
    return composeFilter(
        params,
        `format=rgba,
        pad=width=${params.width}:height=${params.height}:x=(ow-iw)/2:y=(oh-ih)/2:color=black@0`
    )
}

export function overlay(params: FilterParams) {
    return composeFilter(
        params,
        `overlay=0:0`
    )
}

export function scale2ref(params: FilterParams) {
    return composeFilter(
        params,
        `scale2ref`
    )
}

export function alphamerge(params: FilterParams) {
    return composeFilter(
        params,
        `alphamerge`
    )
}

export function fps(params: FpsFilterParams) {
    return composeFilter(
        params,
        `fps=${params.fps}`
    )
}

export function rgba(params: FilterParams) {
    return composeFilter(
        params,
        `format=rgba`
    )
}

export function split(params: FilterParams) {
    return composeFilter(
        params,
        `split`
    )
}

export function palettegen(params: PalettegenFilterParams) {
    return composeFilter(
        params,
        `palettegen=max_colors=${params.maxColors}`
    )
}

export function paletteuse(params: FilterParams) {
    return composeFilter(
        params,
        `paletteuse=dither=bayer`
    )
}

function composeFilter(params: FilterParams, filter: string) {
    return `${params.input.map(i => `[${i}]`).join('')}${filter}${params.output?.map(o => `[${o}]`).join('') || ''}`
}