import fs from 'fs'
import stream from 'stream'
import { once } from 'events'
import zlib from 'zlib'

// write file from file
await writeFileToFile('src.txt', 'dist.txt')

// write readable from writable stream, in memory
const chunks = ['hello ', 'world ', '!!']
const memoryWritable = await writeChunksToMemory(chunks)

// write file from iterable
const iterable = ['hello ', 'world ', '!!']
await writeIterableToFile(iterable, 'dist.txt')

// multi streams: read file, compress it, write file
await writeCompressedFileToFile('src.txt', 'dist.txt.gz')

// functions
async function writeFileToFile(src, dist) {
  const readable = fs.createReadStream(src, {
    highWaterMark: 6
  })
  const writable = fs.createWriteStream(dist)

  let i = 1
  for await (const chunk of readable) {
    console.log(`chunk${i++}: "${chunk}"`)
    const internalBuffer_isFull = !writable.write(chunk)

    // backpressure handling, avoid overwhelming performance
    if (internalBuffer_isFull)
      await once(writable, 'drain')
  }

  writable.end()
  // next readable.write() will throw error !!

  await once(writable, 'finish')
}

async function writeChunksToMemory(chunks) {
  const readable = new stream.Readable()
  const writable = new stream.Writable()

  let i = 1
  writable._write = (buffer, encoding, next) => {
    const chunk = buffer.toString()
    console.log(`chunk${i++}: "${chunk}"`)
    next()
  }

  readable.pipe(writable)
  // pipe() establish uniDirectional flow
  // connect readable to writable stream
  // automatically pass data from readable to writable stream

  chunks.forEach(chunk => readable.push(chunk))
  // pipe() automatically add:
  // readable.on('data', chunk => writable.write(chunk))

  readable.push(null) // emit 'end' signal
  // pipe() automatically add:
  // readable.on('end', () => writable.end())

  await once(writable, 'finish')
  return writable
}

async function writeIterableToFile(iterable, dist) {
  const writable = fs.createWriteStream(dist)

  let i = 1
  for await (const chunk of iterable) {
    const internalBuffer_isFull = !writable.write(chunk)
    console.log(`chunk${i++}: "${chunk}"`)

    // backpressure handling, avoid overwhelming performance
    if (internalBuffer_isFull)
      await once(writable, 'drain')
  }

  writable.end()

  await once(writable, 'finish')
}

async function writeCompressedFileToFile(src, dist) {
  const readable = fs.createReadStream(src)
  const writable = fs.createWriteStream(dist)
  const gzip = zlib.createGzip()

  const handleErr = err => {
    if (err) console.error('Pipeline failed', err)
    else console.log('Pipeline succeeded')
  }

  stream.pipeline(
    readable,
    gzip,
    writable,
    handleErr
  )

  /** legacy .pipe()
    readable
      .on('error', console.error)
      .pipe(gzip)
      .on('error', console.error)
      .pipe(writable)
      .on('error', console.error)
      .on('finish', () => console.log('Pipes succeeded'))
   */
}
