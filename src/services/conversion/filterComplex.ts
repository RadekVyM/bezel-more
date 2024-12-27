type FilterParams = {
    input: string[],
    output?: string[]
}

type TrimAndTpadFilterParams = {
    startTrimTime: number | null,
    endTrimTime: number | null,
    startPadDuration: number,
    endPadDuration: number
} & FilterParams

type ScaleFilterParams = {
    width: number,
    height: number,
    ignoreOriginalAspectRatio?: boolean,
} & FilterParams

type ScaleToWidthFilterParams = {
    width: number,
} & FilterParams

type PadFilterParams = {
    width: number,
    height: number,
    x?: number,
    y?: number
} & FilterParams

type FpsFilterParams = {
    fps: number
} & FilterParams

type PalettegenFilterParams = {
    maxColors: number
} & FilterParams

export function compose(...filters: string[]) {
    return filters.join(';');
}

export function trimAndTpad(params: TrimAndTpadFilterParams) {
    const startTrim = params.startTrimTime ? `start=${params.startTrimTime}` : undefined;
    const endTrim = params.endTrimTime ? `end=${params.endTrimTime}` : undefined;
    const startPad = `start_mode=clone:start_duration=${params.startPadDuration}`;
    const endPad = `stop_mode=clone:stop_duration=${params.endPadDuration}`;
    const trim = [startTrim, endTrim].filter((t) => t).join(':');

    return composeFilter(
        params,
        `${trim.length > 0 ? `trim=${trim},setpts=PTS-STARTPTS,` : ''}tpad=${startPad}:${endPad},setpts=PTS-STARTPTS`
    );
}

export function scale(params: ScaleFilterParams) {
    const forceAspectRatio = params.ignoreOriginalAspectRatio ?
        '' :
        `:force_original_aspect_ratio=decrease:flags=lanczos,pad=${params.width}:${params.height}:(((ow-iw)/2)):(((oh-ih)/2))`;

    return composeFilter(
        params,
        `scale=w=${params.width}:h=${params.height}${forceAspectRatio}`
    );
}

export function scaleToWidth(params: ScaleToWidthFilterParams) {
    return composeFilter(
        params,
        `scale=${params.width}:trunc(ow/a/2)*2`
    );
}

export function pad(params: PadFilterParams) {
    const x = params.x || params.x === 0 ? Math.max(params.x, 0).toString() : '(ow-iw)/2';
    const y = params.y || params.y === 0 ? Math.max(params.y, 0).toString() : '(oh-ih)/2';

    return composeFilter(
        params,
        `format=rgba,
        pad=width=${params.width}:height=${params.height}:x=${x}:y=${y}:color=black@0`
    );
}

export function overlay(params: FilterParams) {
    return composeFilter(
        params,
        `overlay=0:0`
    );
}

export function scale2ref(params: FilterParams) {
    return composeFilter(
        params,
        `scale2ref`
    );
}

export function alphamerge(params: FilterParams) {
    return composeFilter(
        params,
        `alphamerge`
    );
}

export function fps(params: FpsFilterParams) {
    return composeFilter(
        params,
        `fps=${params.fps}`
    );
}

export function yuv(params: FilterParams) {
    return composeFilter(
        params,
        `format=yuv420p`
    );
}

export function split(params: FilterParams) {
    return composeFilter(
        params,
        `split`
    );
}

export function palettegen(params: PalettegenFilterParams) {
    return composeFilter(
        params,
        `palettegen=max_colors=${params.maxColors}`
    );
}

export function paletteuse(params: FilterParams) {
    return composeFilter(
        params,
        `paletteuse=dither=bayer`
    );
}

function composeFilter(params: FilterParams, filter: string) {
    return `${params.input.map(i => `[${i}]`).join('')}${filter}${params.output?.map(o => `[${o}]`).join('') || ''}`
}