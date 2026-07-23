## @ezuikit/player-hls

HLS 直播/点播播放器，一套 API 内置**硬解（hls.js）**与**软解（WASM + WebGL）**两套引擎：H.264 走硬解降低开销，H.265 由软解跨浏览器兜底，二者自动切换，调用方无感。

## 特性

- 🎯 **一套 API，两种解码**：`auto` 模式硬解优先，浏览器无法解码（如 H.265）时自动降级软解。
- 🎥 **H.265 跨浏览器**：软解引擎自绘，不依赖浏览器原生 H.265 能力。
- 📺 **直播 / 点播 / 回放**：支持 TS、fMP4、LL-HLS；内建萤石开放平台直播与回放地址处理。
- 🎨 **内置主题与控件**：基于 `@ezuikit/player-theme`，自带皮肤、全屏、缩放、截图等。
- 🧩 **TypeScript 友好**：完整类型声明。

注意： 暂不提供CDN地址，decoder静态资源需要放置在自己的服务器下（node_modules/@ezuikit/player-hls/dist 下 decoder.wasm 和 decoder.worker.js 文件， 这两个文件需要在同一个文件夹下）

注意： 暂不提供CDN地址，decoder静态资源需要放置在自己的服务器下（node_modules/@ezuikit/player-hls/dist 下 decoder.wasm 和 decoder.worker.js 文件， 这两个文件需要在同一个文件夹下）

注意： 暂不提供CDN地址，decoder静态资源需要放置在自己的服务器下（node_modules/@ezuikit/player-hls/dist 下 decoder.wasm 和 decoder.worker.js 文件， 这两个文件需要在同一个文件夹下）

## 安装

```bash
# npm
npm install @ezuikit/player-hls

# yarn
npm add @ezuikit/player-hls

# pnpm
pnpm add @ezuikit/player-hls
```

## 快速开始

### ES Module

```ts
import "@ezuikit/player-hls/dist/style/css.js"; // @sine 2.x 开始支持主题UI
import HLSPlayer from "@ezuikit/player-hls";

const player = new HLSPlayer({
  id: "app", // 容器元素 id
  url: "https://open.ys7.com/v3/openlive/E71992743_1_1.m3u8",
  staticPath: "/", // 软解静态资源目录（见下文）
  autoPlay: true,
  accessToken: "xxxx", // 非必填， 如果是萤石 ll-hls 回放流是必须的， @sine 2.x
});

// 播放（默认 autoPlay:true 时会在资源就绪后自动播放）
// 不会立即生效
// 1. 需要等待静态资源加载完成（js, wasm）
// 2. 需要视频返回并且有视频帧
player.play();

// 暂停
player.pause();

// 销毁
player.destroy();
```

> `autoPlay` 并非“立即出画面”：需要等待①静态资源加载完成（软解的 js/wasm）②首个视频帧返回。

### UMD（浏览器 `<script>`）

```html
<div id="app" style="width:600px;height:400px"></div>
<!-- 文件来源 node_modules/@ezuikit/player-hls/dist -->
<!-- 主题样式 @2.0.0 -->
<link rel="stylesheet" href="./dist/style/css.css" />
<script src="./dist/index.umd.js"></script>
<script>
  var player = new HlsPlayer({
    id: "app",
    url: "https://.../xxx.m3u8",
    staticPath: "./", // 与 decoder.wasm / decoder.worker.js 同目录
    accessToken: "xxxx", // 非必填， 如果是萤石 ll-hls 回放流是必须的， @sine 2.x
  });
</script>
```

## 静态资源（软解必读）

软解引擎依赖两个文件：`decoder.wasm` 与 `decoder.worker.js`（位于 `node_modules/@ezuikit/player-hls/dist/`）。

- 二者**必须放在同一目录**，把该目录路径通过 `staticPath` 传入。
- 暂不提供 CDN，请将文件部署到自己的服务器/静态目录。
- **硬解不需要**这两个文件；仅在使用软解（或 `auto` 降级到软解）时需要。

例如把两个文件放到站点根目录 `/`，则 `staticPath: "/"`；放到 `/assets/hls/` 则 `staticPath: "/assets/hls/"`。

## 解码方式（decoderType）

2.x 开始支持

| 取值             | 引擎                      | 说明                                              |
| ---------------- | ------------------------- | ------------------------------------------------- |
| `"auto"`（默认） | 硬解优先                  | 硬解失败（`MEDIA_ERROR`，常见 H.265）自动降级软解 |
| `"hard"`         | hls.js + MSE + `<video>`  | H.264 首选，开销低；仍会在解码失败时降级软解      |
| `"soft"`         | WASM + WebGL + `<canvas>` | 跨浏览器 H.265/H.264，需配置 `staticPath`         |

## 配置项

构造参数继承主题配置（`@ezuikit/player-theme`），下表为常用项：

| 参数                 | 类型                               | 默认值                                        | 说明                                               |
| -------------------- | ---------------------------------- | --------------------------------------------- | -------------------------------------------------- |
| `url`                | `string`                           | —                                             | **必填**，播放地址（.m3u8）                        |
| `id`                 | `string`                           | —                                             | 容器元素 id（与 `container` 二选一）               |
| `container`          | `HTMLElement \| () => HTMLElement` | —                                             | 容器元素（优先于 `id`）                            |
| `decoderType`        | `"auto" \| "hard" \| "soft"`       | `"auto"`                                      | 解码方式                                           |
| `autoPlay`           | `boolean`                          | `true`                                        | 自动播放                                           |
| `isLive`             | `boolean`                          | `false`                                       | 是否直播；`true` 时每次 `play` 都重新拉流          |
| `muted`              | `boolean`                          | `true`                                        | 是否静音（自动播放通常需静音）                     |
| `volume`             | `number`                           | `0.8`                                         | 音量 `[0.0 ~ 1.0]`                                 |
| `staticPath`         | `string`                           | `""`                                          | 软解静态资源目录                                   |
| `width` / `height`   | `number \| string`                 | —                                             | 播放器尺寸                                         |
| `scaleMode`          | `0 \| 1 \| 2`                      | `1`                                           | 填充模式：0 完全填充 / 1 等比最大边 / 2 等比最小边 |
| `lowLatencyMode`     | `boolean`                          | `true`                                        | 低延迟模式                                         |
| `enableFrameChasing` | `boolean`                          | `true`                                        | 直播追帧（积压超约 2s 时 1.2 倍速追赶）            |
| `isEzviz`            | `boolean`                          | `true`                                        | 萤石开放平台地址处理（追加 `&vc=3` 等）            |
| `accessToken`        | `string`                           | —                                             | 萤石接口令牌，**按时间 seek 回放时必填**           |
| `domain`             | `string`                           | `https://open.ys7.com`                        | 萤石接口域名                                       |
| `disableCollect`     | `boolean`                          | `false`                                       | 关闭数据采集打点                                   |
| `loggerOptions`      | `object`                           | `{ name:"HLS", level:"INFO", showTime:true }` | 日志配置                                           |

## API

### 方法

| 方法                            | 签名                                                                                    | 说明                                                   |
| ------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `play`                          | `play(url?: string): Promise<any>`                                                      | 播放；传 `url` 表示切换新地址并重新开始                |
| `pause`                         | `pause(): boolean`                                                                      | 暂停                                                   |
| `seek`                          | `seek(second: number \| string): Promise<boolean>`                                      | 点播传秒数；萤石回放传时间字符串（见下文）；直播不支持 |
| `destroy`                       | `destroy(): boolean`                                                                    | 销毁实例与 DOM                                         |
| `screenshot`                    | `screenshot(filename?, format?, quality?, type?): Promise<string \| Blob \| undefined>` | 截图，见下                                             |
| `getVersion`                    | `getVersion(): string`                                                                  | 获取版本号                                             |
| `resize`                        | `resize(width, height): void`                                                           | 调整尺寸（主题能力）                                   |
| `fullscreen` / `exitFullscreen` | `(): void`                                                                              | 进入 / 退出全屏（主题能力）                            |
| `setScaleMode`                  | `setScaleMode(mode: 0\|1\|2): void`                                                     | 设置填充模式（主题能力）                               |
| `setLoggerOptions`              | `setLoggerOptions({ level }): void`                                                     | 设置日志等级（主题能力）                               |

### 属性

| 属性          | 类型             | 说明                       |
| ------------- | ---------------- | -------------------------- |
| `duration`    | `number`（只读） | 时长（秒），直播为实时时长 |
| `currentTime` | `number`（只读） | 当前播放位置（秒）         |
| `volume`      | `number`         | 音量 `[0.0 ~ 1.0]`，可读写 |
| `muted`       | `boolean`        | 静音，可读写               |

### 静态成员

| 成员                                     | 说明                                           |
| ---------------------------------------- | ---------------------------------------------- |
| `HLSPlayer.version`                      | 版本号                                         |
| `HLSPlayer.supportType({ url?, type? })` | 是否支持该地址/类型（`.m3u8` 或 `type:"hls"`） |
| `HLSPlayer.HLSEVENTS`                    | 事件名常量集合                                 |

### 截图

```ts
// 返回 Promise；undefined 代表截图失败
player.screenshot(); // 默认：下载 png
player.screenshot("snap", "jpeg", 0.7, "base64"); // 返回 base64 字符串
player
  .screenshot("snap", "png", 0.92, "blob") // 返回 Blob
  .then((res) => {
    /* ... */
  });
```

- `filename`：文件名，默认时间戳。
- `format`：`png` | `jpeg` | `webp`，默认 `png`（`jpeg`/`webp` 才建议配 `quality`）。
- `quality`：`0 ~ 1`，默认 `0.92`。
- `type`：`download`（默认，下载并返回 Blob）| `base64` | `blob`。
- 硬解下 Mac Safari 部分截图可能为黑屏。

## 事件

`HLSPlayer` 本身是事件发射器，使用 `player.on(name, cb)` 监听。事件名建议引用 `HLSPlayer.HLSEVENTS`。

```ts
player.on("initSuccess", ({ decoderType }) =>
  console.log("解码方式:", decoderType),
);
player.on("videoInfo", (info) =>
  console.log(info.codec, info.width, info.height),
);
player.on("error", (e) => console.error(e));
```

| 事件                          | 载荷                                | 说明                               |
| ----------------------------- | ----------------------------------- | ---------------------------------- |
| `initSuccess`                 | `{ decoderType: "hard" \| "soft" }` | 引擎初始化成功                     |
| `videoInfo`                   | `{ codec, width, height }`          | 视频信息（编码/分辨率）            |
| `audioInfo`                   | `{ codec, sampleRate, channels }`   | 音频信息                           |
| `timeupdate`                  | `currentTime: number`               | 播放位置更新                       |
| `durationchange`              | `duration: number`                  | 时长变化（常见于直播）             |
| `volumechange`                | `(volume, muted)`                   | 音量/静音变化                      |
| `loadstart`                   | —                                   | 开始加载 m3u8                      |
| `segment_ended`               | `kind`                              | 分段加载完成                       |
| `ended`                       | —                                   | 点播播放结束                       |
| `seeking` / `seeked`          | —                                   | seek 开始 / 完成                   |
| `wasm_loaded` / `wasm_failed` | —                                   | 软解 WASM 加载成功 / 失败          |
| `error`                       | `detail`                            | 通用错误                           |
| `network_error`               | —                                   | 网络错误                           |
| `media_error`                 | —                                   | 媒体（解码）错误，触发 `auto` 降级 |
| `abort`                       | —                                   | 中断/停止                          |

> 完整事件名见 [`src/constant/event.ts`](./src/constant/event.ts)。

## 萤石开放平台：直播与回放

`isEzviz` 默认 `true`。地址类型不同，行为不同：

- **直播**（路径含 `/openlive/`）：不支持 `seek`。
- **回放**（LL-HLS，路径含 `/openpb/llhls/`）：`seek` 传**时间字符串** `YYYYMMDDHHmmss`，播放器通过萤石接口换取新地址后切流，此时必须提供 `accessToken`（及可选 `domain`）。

```ts
const player = new HLSPlayer({
  id: "app",
  url: "https://open.ys7.com/v3/openpb/llhls/XXXX_1_1.m3u8?begin=...&end=...",
  accessToken: "your_access_token",
});

// 回放按时间跳转
player.seek("20260716010000");

// 普通点播按秒跳转
player.seek(30);
```

> 地址换取为示例实现，接入方应按自身业务与 [萤石文档](https://open.ys7.com/help/1414) 调整。

## 常见问题

- **调用 `play()` 没立即出画面？** 需等静态资源（软解 js/wasm）与首帧就绪；可监听 `initSuccess` / `videoInfo`。
- **H.265 播放黑屏或报 `media_error`？** 确认 `staticPath` 指向的目录下存在 `decoder.wasm` 与 `decoder.worker.js`（软解才需要）。
- **`seek` 返回 `false`？** 直播不支持 seek；萤石回放按时间 seek 需 `accessToken`；点播需传数字秒。
- **自动播放失败？** 浏览器策略通常要求静音自动播放，保持 `muted: true`。
