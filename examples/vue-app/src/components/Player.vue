<script setup>
import { onMounted } from 'vue'
import HlsPlayer from '@ezuikit/player-hls';

let player = null

onMounted(() => {
  // 依赖的解码资源在 public 目录下 (必须的)
  /** @type {HlsPlayer} */
  player = new HlsPlayer({
    id: 'container',
    url: 'https://open.ys7.com/v3/openlive/L28647609_1_2.m3u8?expire=1764644823&id=915914456004136960&t=cbad467c0cc2dcafa9e8b663e1fcee506dc0ad9863e931d77b4423a25a6e3130&ev=101&supportH265=1',
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
