## @ezuikit/player-hls

## 安装

```bash
# npm
npm install @ezuikit/player-hls

# yarn
npm add @ezuikit/player-hls

# pnpm
pnpm add @ezuikit/player-hls
```

### 支持 script 引入

```html
<!-- 文件来源 node_modules/@ezuikit/player-hls/dist -->
<script src='./index.umd.js'></script>
```

## 使用

```ts
// 推荐
import HLSPlayer from '@ezuikit/player-hls';

// 默认自动播放
const player = new HLSPlayer({
  id: 'app',
  url: 'https://open.ys7.com/v3/openlive/E71992743_1_1.m3u8',
  staticPath: "/" // decoder静态资源文件夹
});

// 不会立即生效
// 1. 需要等待静态资源加载完成（js, wasm）
// 2. 需要视频返回并且有视频帧
player.play(); //

// 暂停
player.pause();
```


注意： 暂不提供CDN地址，decoder静态资源需要放置在自己的服务器下（node_modules/@ezuikit/player-hls/dist 下 decoder.wasm 和 decoder.worker.js 文件， 这两个文件需要在同一个文件夹下）

注意： 暂不提供CDN地址，decoder静态资源需要放置在自己的服务器下（node_modules/@ezuikit/player-hls/dist 下 decoder.wasm 和 decoder.worker.js 文件， 这两个文件需要在同一个文件夹下）

注意： 暂不提供CDN地址，decoder静态资源需要放置在自己的服务器下（node_modules/@ezuikit/player-hls/dist 下 decoder.wasm 和 decoder.worker.js 文件， 这两个文件需要在同一个文件夹下）
