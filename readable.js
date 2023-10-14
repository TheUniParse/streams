import { createReadStream } from 'fs'
import { Readable } from 'stream'
import { once } from 'events'

// read from file
const fileReadable = createReadStream('src.txt', {
  encoding: 'utf8',
  highWaterMark: 6 // bytes, max buffer size
})
//await readStream_flowintMode_forAwait(fileReadable)
//await readStream_flowingMode_onData(fileReadable)
//await readStream_pausedMode_onReadable(fileReadable)

// read from memory
const memory = 'content from memory !!'
const memoryReadable = Readable.from(memory)
//await readStream_flowintMode_forAwait(memoryReadable)

// read from iterable
async function* generate() {
  yield 'hello '
  yield 'world '
  yield '!!'
}
const iterable = generate()
const iterableReadable = Readable.from(iterable)
//await readStream_flowintMode_forAwait(iterableReadable)

// ...




// functions
async function readStream_flowintMode_forAwait(readable) {
  const startTime = performance.now()

  let data = '', i = 1, prevTime = startTime
  for await (const chunk of readable) {
    const chunkTime = (performance.now() - prevTime).toFixed(2)
    prevTime = performance.now()

    console.log(`chunk${i++}: "${chunk}" : ${chunkTime}ms`)

    data += chunk
  }

  const totalTime = (performance.now() - startTime).toFixed(2)
  console.log(`total: "${data}" : ${totalTime}ms\n`)

  return data
}

async function readStream_flowingMode_onData(readable) {
  const startTime = performance.now()

  let data = '', i = 1, prevTime = startTime
  readable.on('data', chunk => {
    const chunkTime = (performance.now() - prevTime).toFixed(2)
    prevTime = performance.now()

    console.log(`chunk${i++}: "${chunk}" : ${chunkTime}ms`)

    data += chunk
  })

  readable.on('error', err => console.error(err))

  await once(readable, 'end')
  const totalTime = (performance.now() - startTime).toFixed(2)
  console.log(`total: "${data}" : ${totalTime}ms\n`)

  return data
}

async function readStream_pausedMode_onReadable(readable) {
  const startTime = performance.now()

  let data = ''
  readable.on('readable', () => {
    let chunk, i = 1, prevTime = startTime
    while (chunk = readable.read()) { // !== null
      const chunkTime = (performance.now() - prevTime).toFixed(2)
      prevTime = performance.now()

      console.log(`chunk${i++}: "${chunk}" : ${chunkTime}ms`)
      data += chunk
    }
  })

  await once(readable, 'end')
  const totalTime = (performance.now() - startTime).toFixed(2)
  console.log(`total: "${data}" : ${totalTime}ms\n`)

  return data
}
