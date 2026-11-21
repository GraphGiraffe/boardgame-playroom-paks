# Звуки Морского боя

Оригинальные сигналы PlayRoom от GraphGiraffe, CC BY-NC-SA 4.0. Мастера
WAV PCM16, 22050 Гц, моно хранятся в [source/audio](../source/audio).
Генератор из корня коллекции — `python3 scripts/generate_battleship_sounds.py --output-dir /tmp/fleet-grid-masters`.
`sdk.py convert-asset` готовит MP3 и записывает SHA-256 мастера в `sdk/assets.json`.
`start` — короткая сирена, `miss` — всплеск, `hit` — удар, `sunk` — погружение.
`sea.sunk` заменяет `sea.hit`; при скрытом потоплении всегда звучит обычное попадание.
`sounds.js` ссылается на MP3 через `PlayroomPack.asset`. Устанавливаемый JSON
содержит по одному сэмплу каждого сигнала для автономного воспроизведения.
