import { ThemeOptions, Theme } from '@ezuikit/player-theme';
export { LoggerOptions } from '@ezuikit/utils-logger';

/**
 * 引擎统一接口。
 *
 * 软解（{@link SoftPlayer}）与硬解（{@link HardHlsPlayer}）两种引擎都实现该契约，
 * 上层 {@link HLSPlayer} 只依赖此接口，从而对具体解码实现无感、可随时切换。
 * 新增对外能力时应同时在两种引擎中提供实现，保证行为一致。
 */
interface IEnginePlayer {
    /** 是否正在播放 */
    playing: boolean;
    /** 音量 [0.0 ~ 1.0] */
    volume: number;
    /** 时长（秒）；直播为实时时长 */
    duration: number;
    /** 当前播放位置（秒） */
    currentTime: number;
    /** 播放；传入 url 表示切换到新地址并重新开始 */
    play: (url?: string) => Promise<any>;
    /** 暂停 */
    pause: () => void;
    /** 设置静音 */
    setMuted: (muted: boolean) => void;
    /** 设置音量 [0.0 ~ 1.0] */
    setVolume: (volume: number) => void;
    /** 销毁引擎并释放资源（解码器 / MSE / WebGL / 音频上下文等） */
    destroy: () => void;
    /** 截图，返回值随 type 而定（base64 字符串 / Blob / 下载后返回 Blob） */
    screenshot: (filename?: string, format?: string, quality?: number, type?: 'download' | 'base64' | 'blob') => Promise<string | Blob | undefined>;
    [key: string]: any;
}

/**
 * HLSPlayer 构造参数。
 *
 * 继承 {@link ThemeOptions}（容器 container、width、height、muted、scaleMode、
 * language、volumeOptions、dblClickFullscreen、themeData、template 等 UI 相关配置），
 * 此处仅声明 HLS 播放相关的扩展字段。默认值见 `constant/index.ts` 的
 * `_$DEFAULT_HLS_OPTIONS$_`。
 */
interface HlsOptions extends ThemeOptions {
    /** 播放地址（.m3u8），必填 */
    url: string;
    /** 萤石开放平台接口的访问令牌，回放 seek（按时间）时必填 */
    accessToken?: string;
    /** 萤石开放平台接口域名，默认 https://open.ys7.com */
    domain?: string;
    /** dom 容器 id（兼容旧用法，优先使用 container） */
    id?: string;
    /** 出错重试次数，默认 5 */
    maxRetries?: number;
    /** 是否是直播，默认 false；为 true 时每次调用 play 都会重新加载播放地址 */
    isLive?: boolean;
    /** decoder 静态资源（decoder.worker.js / decoder.wasm）所在目录，仅软解需要，默认 "" */
    staticPath?: string;
    /** 音量大小 [0.0 ~ 1.0]，默认 0.8 */
    volume?: number;
    /** 自动播放，默认 true */
    autoPlay: boolean;
    /**
     * 解码方式，默认 "auto"。
     * - "auto"：硬解优先，遇到浏览器无法解码（如 H.265）时自动降级为软解
     * - "hard"：强制硬解（hls.js + MSE）
     * - "soft"：强制软解（WASM + WebGL）
     */
    decoderType?: "auto" | "hard" | "soft";
    /** 禁用数据采集，默认 false */
    disableCollect?: boolean;
    /** 日志配置，默认 { name: "HLS", level: "INFO", showTime: true } */
    loggerOptions?: any;
    /**
     * 是否开启低延迟模式，默认 false，开启后会启用一些优化措施来降低直播的延迟，例如减少缓冲区大小、启用快速启动等，但可能会增加卡顿的风险，建议在网络状况较好且对延迟要求较高的场景下开启。
     * 如果设置为 true，则会启用低延迟模式，可能会降低直播的延迟，但也可能会增加卡顿的风险，建议在网络状况较好且对延迟要求较高的场景下开启。
     * 如果设置为 false，则不会启用低延迟模式，可能会增加直播的延迟，但也可能会减少卡顿的风险，适合在网络状况较差或对延迟要求不高的场景下使用。
     */
    lowLatencyMode?: boolean;
    /** 是否追帧 */
    enableFrameChasing?: boolean;
    /**
     * 萤石开放平台播放地址， 默认 true, 当为 true 时 每次调用 play 都会重新加载播放地址
     * 为了给播放地址上强制追加 &vc=3，说明播放器客户端支持 [h264, h265]
     */
    isEzviz?: boolean;
    [key: string]: any;
}

declare const SCREENSHOT_TYPE: {
    readonly download: "download";
    readonly base64: "base64";
    readonly blob: "blob";
};

/**
 * HLS 播放器对外主类，是 SDK 的唯一入口。
 *
 * 职责：
 * - 继承 `Theme`（@ezuikit/player-theme）获得 UI 皮肤、控件、全屏、缩放等交互能力，
 *   `Theme` 本身即 EventEmitter，故实例可直接 `on`/`emit` 事件。
 * - 通过 {@link createPlayer} 创建并持有底层引擎（软解 / 硬解），自身只面向
 *   {@link IEnginePlayer} 编程，对解码实现无感。
 * - 负责 `"auto"` 解码的自动降级：先硬解，监听到 `MEDIA_ERROR` 后切换软解（见 {@link _createPlayer}）。
 * - 处理萤石开放平台特性：强制追加 `&vc=3`、LL-HLS 回放地址获取（{@link EzvizFetcher}）。
 * - 打点采集（{@link Collect}）与对外 API（play/pause/seek/screenshot/destroy 等）。
 *
 * @example
 * ```ts
 * import "@ezuikit/player-hls/dist/style/css.js"; // @sine 2.x
 * import HLSPlayer from "@ezuikit/player-hls";
 * const player = new HLSPlayer({
 *  id: "app",
 *  url: "xxx.m3u8",
 *  staticPath: "/"
 *  accessToken: "xxxx", // 非必填, 如果是萤石 ll-hls 回放流需要 @sine 2.x
 * });
 * player.play();
 * ```
 */
declare class HLSPlayer extends Theme {
    static HLSEVENTS: {
        WASM_LOADED: string;
        WASM_FAILED: string;
        ERROR: string;
        NETWORK_ERROR: string;
        MEDIA_ERROR: string;
        UNKNOWN: string;
        ABORT: string;
        INIT: string;
        LOADING: string;
        VIDEO_INFO: string;
        AUDIO_INFO: string;
        INIT_SUCCESS: string;
        LOAD_START: string;
        DURATION_CHANGE: string;
        LOADED_META_DATA: string;
        ENDED: string;
        SEGMENT_ENDED: string;
        RATE_CHANGE: string;
        TIME_UPDATE: string;
        VOLUME_CHANGE: string;
        SEEKING: string;
        SEEKED: string;
        loading: "loading";
        play: "play";
        capturePicture: "capturePicture";
        volumechange: "volumechange";
        zoomChange: "zoomChange";
        zoomingChange: "zoomingChange";
        zoomTranslateChange: "zoomTranslateChange";
        audioInfo: "audioInfo";
        videoInfo: "videoInfo";
        firstFrameDisplay: "firstFrameDisplay";
        fullscreen: "fullscreen";
        exitFullscreen: "exitFullscreen";
        fullscreenChange: "fullscreenChange";
        resize: "resize";
        orientationChange: "orientationChange";
        audioCodecUnsupported: "audioCodecUnsupported";
        changeTheme: "changeTheme";
        recTypeChange: "recTypeChange";
        definitionChange: "definitionChange";
        speedChange: "speedChange";
        recordingChange: "recordingChange";
        talkingChange: "talkingChange";
        talkVolumeChange: "talkVolumeChange";
        broadcastChange: "broadcastChange";
        aichatChange: "aichatChange";
        liveChange: "liveChange";
        recDropdownChange: "recDropdownChange";
        alarmMessageChange: "alarmMessageChange";
        setLoggerOptions: "setLoggerOptions";
        records: "records";
        ptzSpeedChange: "ptzSpeedChange";
        setVideoLevelList: "setVideoLevelList";
        currentVideoLevel: "currentVideoLevel";
        currentVideoLevelAuto: "currentVideoLevelAuto";
        setAllDayRecTimes: "setAllDayRecTimes";
        getOSDTime: "getOSDTime";
        control: {
            readonly play: "Control.play";
            readonly playDestroy: "Control.playDestroy";
            readonly capturePicture: "Control.capturePicture";
            readonly capturePictureResult: "Control.capturePictureResult";
            readonly capturePictureDestroy: "Control.capturePictureDestroy";
            readonly volumechange: "Control.volumechange";
            readonly volumePanelOpenChange: "Control.volumePanelOpenChange";
            readonly volumeDestroy: "Control.volumeDestroy";
            readonly controlsBarOpenChange: "Control.controlsBarOpenChange";
            readonly headerMoreShowControlsChange: "Control.headerMoreShowControlsChange";
            readonly headerMorePanelOpenChange: "Control.headerMorePanelOpenChange";
            readonly footerMoreShowControlsChange: "Control.footerMoreShowControlsChange";
            readonly footerMorePanelOpenChange: "Control.footerMorePanelOpenChange";
            readonly deviceDestroy: "Control.deviceDestroy";
            readonly recTypeChange: "Control.recTypeChange";
            readonly recDestroy: "Control.recDestroy";
            readonly definitionChange: "Control.definitionChange";
            readonly definitionList: "Control.definitionList";
            readonly definitionPanelOpenChange: "Control.definitionPanelOpenChange";
            readonly definitionDestroy: "Control.definitionDestroy";
            readonly speedChange: "Control.speedChange";
            readonly speedPanelOpenChange: "Control.speedPanelOpenChange";
            readonly speedDestroy: "Control.speedDestroy";
            readonly ptzPanelOpenChange: "Control.ptzPanelOpenChange";
            readonly ptzSpeedChange: "Control.ptzSpeedChange";
            readonly ptzError: "Control.ptzError";
            readonly ptzDestroy: "Control.ptzDestroy";
            readonly recordingChange: "Control.recordingChange";
            readonly recordDestroy: "Control.recordDestroy";
            readonly talkingChange: "Control.talkingChange";
            readonly talkError: "Control.talkError";
            readonly talkDestroy: "Control.talkDestroy";
            readonly broadcastChange: "Control.broadcastChange";
            readonly broadcastDestroy: "Control.broadcastDestroy";
            readonly aichatChange: "Control.aichatChange";
            readonly aichatDestroy: "Control.aichatDestroy";
            readonly liveChange: "Control.liveChange";
            readonly liveDestroy: "Control.liveDestroy";
            readonly recDropdownChange: "Control.recDropdownChange";
            readonly recDropdownDestroy: "Control.recDropdownDestroy";
            readonly alarmMessageChange: "Control.alarmMessageChange";
            readonly alarmMessageDestroy: "Control.alarmMessageDestroy";
            readonly zoomChange: "Control.zoomChange";
            readonly zoomPanelOpenChange: "Control.zoomPanelOpenChange";
            readonly zoomDestroy: "Control.zoomDestroy";
            readonly fullscreenDestroy: "Control.fullscreenDestroy";
            readonly globalFullscreenDestroy: "Control.globalFullscreenDestroy";
            readonly datePanelOpenChange: "Control.datePanelOpenChange";
            readonly dateChange: "Control.dateChange";
            readonly dateMonthChange: "Control.dateMonthChange";
            readonly dateDestroy: "Control.datePanelDestroy";
            readonly timeLineChange: "Control.timeLineChange";
            readonly timeLinePanelOpenChange: "Control.timeLinePanelOpenChange";
            readonly timeLineDestroy: "Control.timeLineDestroy";
            readonly beforeMountControls: "Control.beforeMountControls";
            readonly mountedControls: "Control.mountedControls";
            readonly beforeUnmountControls: "Control.beforeUnmountControls";
            readonly unmountedControls: "Control.unmountedControls";
            readonly posterDestroy: "Control.posterDestroy";
            readonly loadingDestroy: "Control.loadingDestroy";
            readonly messageDestroy: "Control.messageDestroy";
            readonly contentDestroy: "Control.contentDestroy";
            readonly contentRerender: "Control.contentRerender";
        };
        theme: {
            readonly beforeDestroy: "Theme.beforeDestroy";
            readonly destroyed: "Theme.destroyed";
            readonly mobileExtendDestroy: "Theme.mobileExtendDestroy";
            readonly recFooterDestroy: "Theme.recFooterDestroy";
        };
        message: "message";
    };
    /** WebAssembly completed loading identity */
    static __HLS_WASM_DecoderState__: number;
    url: string;
    playParam: any;
    player: IEnginePlayer;
    onPlayTime: any;
    onParsed: any;
    onSeekStart: null;
    onLoadCache?: any;
    onLoadCacheFinished?: any;
    onPlayFinish: any;
    onError: null;
    audioCodecUnsupported: boolean;
    private readonly _ezvizFetcher;
    /**
     * 兼容 event 属性：Theme 自身就是 EventEmitter，
     * 子组件（HardHlsPlayer / SoftPlayer / M3U8Parser）通过 options.event 使用
     */
    get event(): this;
    constructor(options: Partial<HlsOptions>);
    get duration(): number;
    get currentTime(): number;
    /**
     * 播放
     * @returns {Promise<any>}
     */
    play(url?: string): Promise<void>;
    /**
     * 暂停
     */
    pause(): boolean;
    /**
     * seek
     * @param {number | string} time 单位秒 或 时间（YYYYMMDDHHmmss）
     * @returns {Promise<boolean>}
     *
     * @example
     * player.seek(2) // VOD
     * player.seek("20260610010000") // 萤石 ll-hls 回放
     */
    seek(second: number | string): Promise<any>;
    /**
     * 销毁实例和dom
     */
    destroy(): boolean;
    /**
     * 截图，调用后弹出下载框保存截图, (硬解下 Mac Safari 部分截图结果是黑色的)
     * @param {string=} filename 保存的文件名, 默认 时间戳
     * @param {string=} format 截图的格式，可选png或jpeg或者webp ,默认 png
     * @param {number=} quality 当格式是jpeg或者webp时，压缩质量(png quality 参数通常不会生效, 推荐 jpeg)，取值0 ~ 1 ,默认 0.92
     * @param {("download" | "base64" | "blob")} type  download,base64,blob, 默认download
     *
     * @returns {Promise<string | Blob | undefined>} undefined 代表截图失败, 下载也会返回 Blob
     * @since 1.0.3， 2.0.0（改为Promise）
     * @example
     * player.screenshot().then(res => {})
     * player.screenshot("filename", "jpeg", 0.7, "download")
     */
    screenshot(filename: any, format?: string, quality?: number, type?: (typeof SCREENSHOT_TYPE)[keyof typeof SCREENSHOT_TYPE]): Promise<string | Blob | undefined>;
    /**
     * 片段列表
     */
    get segments(): any;
    /**
     * 当前版本
     */
    static version: string;
    /**
     * 获取版本号
     */
    getVersion(): string;
    /**
     * 静态方法 判断是否支持播放地址
     */
    static supportType(options: Partial<{
        url?: string;
        type?: string;
    }>): boolean;
    /**
     * 创建底层引擎并接线事件。
     *
     * 选择策略：`decoderType === "soft"` 直接软解，否则（含 "auto"/"hard"）先硬解。
     * 当解码方式不是强制软解时，注册一次性 `MEDIA_ERROR` 监听：一旦硬解因浏览器
     * 无法解码（常见于 H.265）而报错，就销毁硬解引擎并重建为软解引擎，实现
     * “auto” 的自动降级。强制 "hard" 时同样会降级——如需严格硬解可自行拦截该事件。
     *
     * @param options 引擎参数（已注入 container=视频/画布挂载点、event=事件总线、logger）
     */
    _createPlayer(options: any): void;
}

/**
 * @packageDocumentation
 * `@ezuikit/player-hls` 的包入口。
 *
 * 默认导出 {@link HLSPlayer}（对外主类），并导出配置类型 {@link HlsOptions} 与
 * {@link LoggerOptions}，供 TypeScript 使用者进行类型标注。
 */

export { HLSPlayer as default };
export type { HlsOptions };
