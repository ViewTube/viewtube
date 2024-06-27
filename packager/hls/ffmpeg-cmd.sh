ffmpeg -y \
  -i videoplayback.webm \
  -preset ultrafast \
  -hls_list_size 0 \
  -hls_time 99999 \
  -hls_playlist_type vod \
  -hls_flags single_file \
  -hls_segment_type fmp4 \
  -hls_segment_filename "playbackyeah.webm" \
  playbackyeah.m3u8