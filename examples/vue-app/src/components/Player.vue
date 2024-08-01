<script setup>
import { onMounted } from 'vue'
import HlsPlayer from '@ezuikit/player-hls';

let player = null

onMounted(() => {
  /** @type {HlsPlayer} */
  player = new HlsPlayer({
    id: 'container',
    url: 'https://open.ys7.com/v3/openlive/AA2615287_1_1.m3u8?expire=1753581976&id=739061430059499520&t=7842a33355d630ec646075c8637e59ae589e733f6b56105812ef37c2b78d0770&ev=100',
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
