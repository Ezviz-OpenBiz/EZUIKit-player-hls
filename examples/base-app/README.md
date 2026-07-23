# base-app（UMD / 原生 `<script>` 示例）

演示如何在无构建工具的纯 HTML 页面中，通过 UMD 包使用 `@ezuikit/player-hls`。

## 依赖的文件

以下文件均来自 `node_modules/@ezuikit/player-hls/dist/`，示例已拷贝到当前目录：

| 文件                        | 说明                                              |
| --------------------------- | ------------------------------------------------- |
| `index.umd.js`              | 播放器 UMD 包，加载后暴露全局变量 `HlsPlayer`     |
| `style/css.css`             | 主题样式（@2.x）                                  |
| `decoder.wasm`              | 软解 WASM，**软解 / auto 降级软解（如 H.265）必需** |
| `decoder.worker.js`         | 软解 Worker，需与 `decoder.wasm` **同目录**       |

> `decoder.wasm` 与 `decoder.worker.js` 必须放在同一目录，并通过构造参数 `staticPath` 指定该目录。本示例把它们放在页面根目录，因此 `staticPath: "./"`。

## 运行

```bash
# 安装本地静态服务器 http-server
yarn install

# 启动，默认 http://localhost:8080
yarn run dev
```

打开 http://localhost:8080 ，在输入框填入 `.m3u8` 地址后点击「初始化并播放」。

## 关键用法

```html
<link rel="stylesheet" href="./style/css.css" />
<script src="./index.umd.js"></script>
<script>
  var player = new HlsPlayer({
    id: "container",
    url: "https://open.ys7.com/v3/openlive/xxxx.m3u8",
    staticPath: "./", // 与 decoder.wasm / decoder.worker.js 同目录
    decoderType: "auto", // auto | hard | soft
    // accessToken: "xxxx", // 萤石 ll-hls 回放按时间 seek 时必填
  });
  player.play();
</script>
```

更多配置、方法与事件见项目根目录 [README](../../README.md)。
