import { LoggerCls } from '@ezuikit/utils-logger';
export { LoggerOptions } from '@ezuikit/utils-logger';
import BasePlayer, { BasePlayerOptions } from '@ezuikit/player-base';
import Hls from 'hls.js';
import EventEmitter from 'eventemitter3';

type Fn$1 = () => any;
declare class AudioCore {
    options: {
        sampleRate: any;
        appendType: any;
        playMode: any;
        isLive: boolean;
    };
    logger: LoggerCls;
    sourceChannel: number;
    audioCtx: AudioContext;
    gainNode: GainNode;
    sourceList: AudioBufferSourceNode[];
    startStatus: boolean;
    sampleQueue: Array<Uint8Array | {
        data: Uint8Array;
    }>;
    nextBuffer: {
        data: any;
        pts: number;
    };
    playTimestamp: number;
    playStartTime: number;
    durationMs: number;
    volume: number;
    onLoadCache: Fn$1;
    seekPos: any;
    constructor(options: any);
    resetStartParam(): void;
    setOnLoadCache(callback: any): void;
    setDurationMs(durationMs?: number): void;
    setVolume(volume?: number): void;
    getAlignVPTS(): number;
    /**
     * @brief Swap SourceNode To Play When before node play end
     */
    swapSource(sourceIndex?: number, dstIndex?: number): null;
    /**
     * @param sampleObj : {data:Uint8Array, pts:xxx}
     */
    addSample(sampleObj?: null): boolean;
    runNextBuffer(): void;
    /**
     * @return
     * 1 queue length == 0, no frame
     * 0 OK
     * -1 sourceIndex out of bounds
     * -2 decode Error
     */
    decodeSample(sourceIndex?: number, dstIndex?: number): 1 | -1 | -2 | 0 | -3;
    /**
     * @return
     * 1 queue length == 0, no frame
     * 0 OK
     * -1 sourceIndex out of bounds
     * -2 decode Error
     */
    decodeWholeSamples(sourceIndex?: number): 1 | -1 | -2 | 0 | -3;
    play(): void;
    pause(): void;
    stop(): void;
    cleanQueue(): void;
}

/**
 * @description yuv 数据结构
 */
declare class YuvStruct {
    pts: number;
    width: number;
    height: number;
    imageBufferY: Uint8Array;
    imageBufferB: Uint8Array;
    imageBufferR: Uint8Array;
    constructor(pts: number, width: number, height: number, imageBufferY: Uint8Array, imageBufferB: Uint8Array, imageBufferR: Uint8Array);
    /**
     *
     * @param pts
     * @param width
     * @param height
     * @param imageBufferY
     * @param imageBufferB
     * @param imageBufferR
     */
    setYuv(pts: number, width: number, height: number, imageBufferY: Uint8Array, imageBufferB: Uint8Array, imageBufferR: Uint8Array): void;
}

declare class Cache {
    limit: number;
    logger: LoggerCls;
    yuvCache: YuvStruct[];
    constructor(options: any);
    appendCacheByCacheYuv(cacheYuvObj: YuvStruct): number;
    getState(): number;
    cleanPipeline(): void;
    shiftYuv(): YuvStruct | null | undefined;
}

declare class WebGlRender {
    gl: WebGLRenderingContext;
    program: WebGLProgram;
    verticesBuffer: WebGLBuffer | null;
    texCoordBuffer: WebGLBuffer | null;
    constructor(canvas: HTMLCanvasElement, options?: any);
    /**
     * @description 渲染视频帧
     * @param {number} videoFrameY
     * @param {number} videoFrameB
     * @param {number} videoFrameR
     * @param {number} width
     * @param {number} height
     */
    renderFrame(videoFrameY: any, videoFrameB: any, videoFrameR: any, width: any, height: any): void;
    /**
     * @description 释放webgl 数据
     */
    destroyContext(): void;
}

interface IEnginePlayer {
    volume: number;
    play: () => Promise<any>;
    pause: () => void;
    setVolume: (volume?: number) => void;
}

declare class BufferFrame {
    pts: number;
    dts: number;
    isKey: boolean;
    data: Uint8Array;
    video: boolean;
    constructor(pts: number, isKey: boolean, data: Uint8Array, isVideo: boolean);
    setFrame(pts: number, isKey: boolean, data: Uint8Array, isVideo: boolean): void;
}

interface HlsOptions extends BasePlayerOptions {
    /** 出错尝试连接次数 默认 20 */
    retry: number;
    /** 是否是直播 默认 true */
    isLive: boolean;
    decoder?: string;
    [key: string]: any;
}

interface UIOptions extends HlsOptions {
    /** 视窗的宽 */
    nodeName: 'video' | 'canvas';
    disableContextmenu: boolean;
}
/**
 * @class UI
 * @description UI
 *
 * @example
 * ```ts
 * const ui = new UIVideo({
 *   id: "id",
 *   width: 100,
 *   height: 100
 * });
 * ```
 */
declare class UIVideo<T extends HTMLVideoElement | HTMLCanvasElement> {
    private readonly _classVideo;
    $video: T;
    logger: any;
    event: any;
    options: any;
    private readonly _$container;
    /**
     * @description 构造函数
     * @param {UIOptions} options
     */
    constructor(options?: Partial<UIOptions>);
    /**
     * @description 渲染 UI
     */
    private _render;
    /**
     * @description 是否是 video 标签
     * @returns {boolean}
     */
    private _isVideo;
    /**
     * @description 销毁
     */
    destroy(): void;
}

interface SoftPlayerOptions extends UIOptions {
    width: number;
    height: number;
    fps: number;
    fixed: any;
    sampleRate: number;
    appendHevcType: number;
    frameDurMs: number;
    id: string;
    audioNone: boolean;
    videoCodec: any;
    logger: LoggerCls;
    decoderWorker: Worker;
    type: 'hls';
    volume: number;
    isLive: boolean;
}
type Fn = (a?: any) => any;
declare class SoftPlayer extends UIVideo<HTMLCanvasElement> implements IEnginePlayer {
    options: SoftPlayerOptions;
    logger: LoggerCls;
    frameList: BufferFrame[];
    cacheInterval: number;
    nowPacket: null;
    stream: Uint8Array;
    vCodecID: number;
    audio: AudioCore;
    liveStartMs: number;
    durationMs: number;
    videoPTS: number;
    loop: number;
    cacheLoop: number;
    playParams: {
        seekPos: number;
        isLive: boolean;
        accurateSeek: boolean;
        seekEvent: boolean;
        realPlay: boolean;
    };
    calculateStartTime: number;
    fix_poc_err_skip: number;
    frameTime: number;
    frameTimeSec: number;
    preCostTime: number;
    _volume: number;
    isPlaying: boolean;
    isCaching: any;
    isNewSeek: boolean;
    flushDecoder: number;
    isCheckDisplay: boolean;
    isPlayLoadingFinish: number;
    vCachePTS: number;
    aCachePTS: number;
    noCacheFrame: number;
    onPlayingTime: Fn;
    onPlayingFinish: Fn;
    onLoadCache: Fn;
    onLoadCacheFinished: Fn;
    gl: WebGlRender;
    cacheYuvBuf: Cache;
    decoderWorker: Worker;
    constructor(options?: Partial<SoftPlayerOptions>);
    setSize(width: any, height: any): void;
    setFrameRate(fps?: number): void;
    setDurationMs(durationMs?: number): void;
    setPlayingCall(callback: any): void;
    get volume(): number;
    set volume(volume: number);
    setVolume(volume?: number): void;
    isPlayingState(): boolean;
    appendAACFrame(streamBytes: any): void;
    appendHevcFrame(streamBytes: BufferFrame): void;
    getCachePTS(): number;
    endAudio(): void;
    cleanSample(): void;
    cleanVideoQueue(): void;
    cleanCacheYUV(): void;
    /**
     * @description pause
     */
    pause(): void;
    checkFinished(mode: any): boolean;
    clearAllCache(): void;
    getNalu1Packet(alginPTS?: boolean): {
        nalBuf: false | Uint8Array;
        pts: number;
    } | null;
    /**
     * @TODO
     */
    cacheThread(): void;
    stopCacheThread(): void;
    /**
     * 缓存中
     */
    loadCache(): void;
    _playFunc(): boolean | undefined;
    /**
     * seekPos=-1,
     * accurateSeek=true,
     * seekEvent=false,
     * realPlay=true
     */
    play(playParams?: any): Promise<void>;
    stop(): void;
    /**
     * @description 释放
     * @returns
     */
    destroy(): boolean;
    /**
     *
     */
    nextNalu(onceGetNalCount?: number): false | Uint8Array;
    /**
     * @brief play yuv cache
     */
    playFrameYUV(show?: boolean): boolean;
    drawImage(width: any, height: any, imageBufferY: any, imageBufferB: any, imageBufferR: any): void;
    checkDisplaySize(widthIn: number, heightIn: number): number[];
    _onWorkerMessage(): void;
    initVideoAndAudio(): void;
}

interface HardHlsPlayerOptions extends Omit<HlsOptions, 'logger'> {
    logger: LoggerCls;
    event: EventEmitter;
    volume: number;
}
/**
 * @classdesc hls 播放器 （h264）
 */
declare class HardHlsPlayer extends UIVideo<HTMLVideoElement> implements IEnginePlayer {
    hlsPlayer: Hls;
    _options: HardHlsPlayerOptions;
    event: EventEmitter;
    _hls: Hls;
    _volume: number;
    logger: LoggerCls;
    constructor(options: HardHlsPlayerOptions);
    private _init;
    isPlayingState(): boolean;
    play(): Promise<void>;
    pause(): void;
    /**
     * @description 获取音量
     * @example
     * ```ts
     * player.volume  // return number
     * ```
     */
    get volume(): number;
    /**
     * @description 设置音量 [0.0 ~ 1.0]
     * @example
     * ```ts
     * player.volume = 0.8
     * ```
     */
    set volume(volume: number);
    /**
     * @description 设置音量 [0.0 ~ 1.0]
     * @param {number} volume
     */
    setVolume(volume?: number): void;
    destroy(): void;
    _onEvent(): void;
}

/**
 * @class UI
 * @description UI
 *
 * @example
 * ```ts
 * const ui = new UIContainer({
 *   id: "id",
 *   width: 100,
 *   height: 100
 * });
 * ```
 */
declare class UIContainer extends BasePlayer {
    private readonly _containerClassName;
    /**
     * @description 构造函数
     * @param {UIOptions} options
     */
    constructor(options?: Partial<HlsOptions>);
    private _render;
    /**
     * @description 销毁
     */
    destroy(): void;
}

/**
 * @description hls 播放器
 */
declare class HLSPlayer extends UIContainer {
    /** WebAssembly completed loading identity */
    static __HLS_WASM_DecoderState__: number;
    private _decoderWorker;
    private _m3u8Obj;
    url: string;
    playParam: any;
    player: SoftPlayer | HardHlsPlayer;
    onPlayTime: any;
    onParsed: any;
    onSeekStart: null;
    onLoadCache?: any;
    onLoadCacheFinished?: any;
    onPlayFinish: any;
    onCacheProcess: any;
    onReadyShowDone: any;
    onError: null;
    _volume: number;
    constructor(options: Partial<HlsOptions>);
    _init(): void;
    /**
     *
     * @description 播放
     * @returns {Promise<any>}
     * @example
     *
     * ```ts
     * player.play()
     * ```
     *
     */
    play(): Promise<void>;
    /**
     * @description 暂停
     * @returns {void}
     *
     * @example
     * ```ts
     * player.pause()
     * ```
     */
    pause(): boolean;
    /**
     * @description 销毁实例和dom
     * @returns {void}
     * @example
     * ```ts
     * player.destroy()
     * ```
     */
    destroy(): boolean;
    /**
     * @description 当前的播放状态
     * @returns {boolean}
     */
    isPlaying(): boolean;
    /**
     * @description 获取音量
     * @example
     * ```ts
     * player.volume  // return number
     * ```
     */
    get volume(): number;
    /**
     * @description 设置音量 [0.0 ~ 1.0]
     * @example
     * ```ts
     * player.volume = 0.8
     * ```
     */
    set volume(volume: number);
    setVolume(volume: number): void;
    /**
     * @description 当前版本
     * @static
     *
     * @example
     * ```ts
     * HlsPlayer.version
     * ```
     */
    static version: string;
    /**
     * @description 获取版本号
     * @returns {string}
     */
    getVersion(): string;
    /**
     * @description 静态方法 判断是否支持播放地址
     * @param {Partial<{ url: string }>} options
     * @returns {boolean}
     * @static
     *
     * @example
     * ```ts
     * HlsPlayer.supportType({url: "https://open.ys7.com/v3/openlive/E71992743_1_1.m3u8"})
     * ```
     */
    static supportType(options: Partial<{
        url?: string;
        type?: string;
    }>): boolean;
    /**
     * @brief m3u8
     */
    _m3u8Entry(): void;
    _checkPlayer(empty: any, isAVC?: boolean): void;
    _hlsOnSamples(readyObj: any, frame: BufferFrame): void;
    _onWorkerMessage(): void;
    _softPlayer(durationMs: any, fps: any, sampleRate: any, size: any, audioNone?: boolean, videoCodec?: null): void;
}

export { type HlsOptions, HLSPlayer as default };
