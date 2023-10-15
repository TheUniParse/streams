import { Readable } from 'stream'
import { delay, pauseProgressBar } from './lib.js'

const iterable = chunksGenerater(4)
const readable = Readable.from(iterable)

// read the stream for 2100ms
readStream(readable)
await delay(2100)

// pause the stream for 3000ms
pauseStream(readable, 3000)
// resume the stream after 3000ms

/** terminal output:
  chunk1: "data1"
  chunk2: "data2"
  paused
  ████████████████████████████████████████ 100% 3000/3000ms
  resumed
  chunk3: "data3"
  chunk4: "data4"
 */

// functions
function readStream(readable) {
  let i = 0
  readable.on('data', chunk =>
    console.log(`chunk${++i}: "${chunk}"`)
  )
}

async function pauseStream(stream, duration) {
  stream.pause()
  console.log('paused')

  await pauseProgressBar(duration)

  stream.resume()
  console.log('resumed')
}

async function* chunksGenerater(num) {
  for (let nth = 1; nth <= num; nth++) {
    await delay(1000)
    yield `data${nth}`
  }
}
