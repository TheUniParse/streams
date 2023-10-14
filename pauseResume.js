import stream from 'stream'

const iterable = clock(4000)
//await readPauseResume(iterable)
await readPauseResumeLegacy(iterable)


// functions
async function readPauseResume(iterable) {
  const readable = stream.Readable.from(iterable)

  let i = 0
  for await (const chunk of readable) {
    console.log(`chunk${++i}: "${chunk}"`)

    if (i !== 2) continue
    const ms = 2000
    console.log(`paused\n... ${ms}ms`)

    await delay(ms)
    console.log('resumed')
  }
}

async function readPauseResumeLegacy(iterable) {
  const readable = stream.Readable.from(iterable)

  let i = 0
  readable.on('data', async chunk => {
    console.log(`chunk${++i}: "${chunk}"`)

    if (i !== 2) return
    const ms = 2000

    readable.pause()
    console.log(`paused\n... ${ms}ms`)

    await delay(ms)
    readable.resume()
    console.log('resumed')
  })
}

async function* clock(duration, intervalDelay = 1000) {
  const start = Date.now()
  for (
    let elapsed = 0;
    elapsed < duration;
    elapsed += intervalDelay
  ) {
    await delay(intervalDelay)
    const currentTime = new Date(start + elapsed)
      .toLocaleTimeString()
    yield currentTime
  }
}

function delay(ms) {
  return new Promise(rs => setTimeout(rs, ms))
}

/** terminal output:
  chunk1: "10:42:02 PM"
  chunk2: "10:42:03 PM"
  paused
  ... 2000ms
  resumed
  chunk3: "10:42:04 PM"
  chunk4: "10:42:05 PM"
 */

