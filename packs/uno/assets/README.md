# Выкрик UNO!

`uno-call.wav` — короткое «Uno!», синтезированное локально 6 октября 2026 года
библиотекой eSpeak NG 1.52.0 (`libespeak-ng.so.1`). Использован стандартный
итальянский голос `it`: он произносит название игры как «Уно». Это синтетический
голос, без подражания конкретному человеку и без загруженных записей.

Параметры `espeak_SetParameter`: rate=180, volume=100, pitch=65, range=65.
Вход — UTF-8 `Uno!`, синхронный вывод eSpeak в PCM через callback.
Файл: WAV PCM, mono, signed 16-bit, 22050 Hz, около 0,32 секунды.

После синтеза FFmpeg удалил тишину в начале и конце, ограничил амплитуду,
добавил плавное начало 6 мс и 70 мс тишины в конце:

```sh
ffmpeg -i uno-call-raw.wav -af 'silenceremove=start_periods=1:start_duration=0.01:start_threshold=-48dB:stop_periods=1:stop_duration=0.05:stop_threshold=-48dB,alimiter=limit=0.84:level=false,afade=t=in:d=0.006,apad=pad_dur=0.07' -ac 1 -ar 22050 -c:a pcm_s16le uno-call.wav
```

`../sounds.js` содержит точную копию байтов WAV в data URI под ключом `uno.call`.
Она нужна для запуска исходной страницы и единого HTML без сетевой загрузки.
При замене WAV нужно обновить base64 в `sounds.js`. Библиотека eSpeak и FFmpeg
нужны только для генерации; в игру и архив движка они не входят.
