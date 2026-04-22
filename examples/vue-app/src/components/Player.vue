<script setup>
import { onBeforeUnmount, ref } from 'vue'
import HlsPlayer from '@ezuikit/player-hls';

let player = null
const url = ref('https://open.ys7.com/v3/openlive/L28647609_1_2.m3u8?expire=1764644823&id=9159144560046960&t=cbad467c0cc2dcafa9e8b663e1fcee506dc0ad9863e931d77b4423a25a6e3130&ev=101&supportH265=1')
const volume = ref(0)

const init = () => {
  if (player) {
    destroy()
  }

  const playUrl = url.value.trim()
  if (!playUrl) {
    console.error('播放地址不能为空')
    return
  }

  // 依赖的解码资源在 public 目录下 (必须的)
  /** @type {HlsPlayer} */
  player = new HlsPlayer({
    id: 'container',
    url: playUrl,
  })
  // 默认自动播放
  // player.play()

  // v0.1.4
  player.event.on("videoInfo", (info) => {
    console.log("videoInfo", info);
  });
}

const play = () => {
  if (player) {
    player.play()
  }
}

const pause = () => {
  if (player) {
    player.pause()
  }
}

const fullscreen = () => {
  if (player) {
    player.fullscreen()
  }
}

const destroy = () => {
  if (player) {
    player.destroy()
    player = null
  }
}

const setVolume = () => {
  if (!player) {
    console.warn('播放器未初始化')
    return
  }

  let nextVolume = Number(volume.value)
  if (Number.isNaN(nextVolume) || nextVolume < 0 || nextVolume > 1) {
    console.error('音量范围应在 0 到 1 之间')
    return
  }

  nextVolume = Math.floor(nextVolume * 100) / 100
  volume.value = nextVolume
  player.setVolume(nextVolume)
}

onBeforeUnmount(() => {
  destroy()
})
</script>

<template>
  <div class="player-wrap">
    <div id="container"></div>

    <div class="controls-row">
      <input v-model="url" class="url-input" placeholder="请输入 m3u8 播放地址" />
      <button @click="init">初始化</button>
      <button @click="pause">暂停</button>
      <button @click="play">播放</button>
      <button @click="fullscreen">全屏</button>
      <button @click="destroy">销毁</button>
    </div>

    <div class="controls-row">
      <label for="volume-input">音量</label>
      <input
        id="volume-input"
        v-model.number="volume"
        class="volume-input"
        type="number"
        min="0"
        max="1"
        step="0.01"
        placeholder="0-1"
      />
      <button @click="setVolume">设置音量</button>
    </div>
  </div>
</template>

<style>
.player-wrap {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.controls-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.url-input {
  width: 600px;
  max-width: 100%;
}

.volume-input {
  width: 100px;
}

#container {
  width: 600px;
  height: 400px;
  background: #000;
}
</style>
