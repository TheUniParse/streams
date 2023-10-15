import { SingleBar, Presets } from 'cli-progress'

export const delay = (ms) =>
  new Promise(rs => setTimeout(rs, ms))


export async function pauseProgressBar(duration, init = 0) {
  const { shades_grey } = Presets
  const bar = new SingleBar({
    format: '{bar} {percentage}% {value}/{total}ms',
    hideCursor: true
  }, shades_grey)

  bar.start(duration, init)

  const increment = 500
  let elapsed = init
  while (elapsed < duration) {
    const timeLeft = duration - elapsed
    if (timeLeft > increment) {
      await delay(increment)
      elapsed += increment
      bar.update(elapsed)
      continue
    }

    await delay(timeLeft)
    elapsed += timeLeft
    bar.update(duration)
  }

  bar.stop()
}
