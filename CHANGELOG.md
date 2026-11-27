## v2.1.0  (2026.11.27)

### Feat

- 新增支持回放主子码流切换（需要支持能力集 support_record_stream_type === "1"）

### Fixed

- Fixed bug

## v2.0.1 (2026.11.27)

### Fixed

- Fixed bug

## v2.0.0

### Feat

- 新增主题
- 支持 `LL-HLS`
- 支持 `fmp4` 播放
- 支持初始化选择软硬解 `decoderType: "soft" | "hard"`
- 默认硬解，不支持或出错自动切换软解播放
- 软解支持 `H264`

## v0.1.4

### Feat

- Add `videoInfo` event, `player.event.on("videoInfo", (info) => {})`
- Update default background color #000

### Fixed

- Fixed layout

## v0.1.3

### Feat

- update deps

## v0.1.1/v0.1.2

### Feat

- update deps

## v0.1.0

### Feat

- 支持hls h264/h265直播播放
