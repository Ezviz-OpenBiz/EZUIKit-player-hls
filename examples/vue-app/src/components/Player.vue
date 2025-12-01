<script setup>
import { onMounted } from 'vue'
import HlsPlayer from '@ezuikit/player-hls';

let player = null

onMounted(() => {
  // 依赖的解码资源在 public 目录下 (必须的)
  /** @type {HlsPlayer} */
  player = new HlsPlayer({
    id: 'container',
    url: 'https://open.ys7.com/v3/openlive/L28647609_1_1.m3u8?expire=1764621652&id=915734222503677952&t=f61fd1b82f26ab47b8e3e6a062a4c5ea80303850f21910f1cedeef908c782b68&ev=101&supportH265=1',
  })
  // 默认自动播放
  // player.play()
})
</script>

<template>
  <div>
    <div id="container"></div>
  </div>
</template>

<style>
#container {
  width: 600px;
  height: 400px;
  background: #000;
}
</style>
