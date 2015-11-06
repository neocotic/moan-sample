/*
 * moan-sample
 * https://github.com/neocotic/moan-sample
 *
 * Copyright (c) 2015 Alasdair Mercer
 * Licensed under the MIT license.
 * https://github.com/neocotic/moan-sample/blob/master/LICENSE.md
 */

'use strict'

const fs = require('fs')
const mkdirp = require('mkdirp')
const mkdirpPromise = require('mkdirp-promise')
const moan = require('moan')
const path = require('path')
const rimraf = require('rimraf')

// Configurations
moan.config('encoding', 'utf8')
moan.config('fileName', 'version.txt')

// File sets
moan.fileSet('outputDir', 'temp/')

// Asynchronous tasks using promises
moan.task('build-async-promise', 'write-async-promise')
moan.task('clean-async-promise', () => {
  return moan.fileSet('outputDir').del()
})
moan.task('log-asnyc-promise', [ 'build-async-promise', 'get-output-dir' ], () => {
  function readFile(filePath, encoding) {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, { encoding }, (error, data) => {
        if (error) {
          reject(error)
        } else {
          resolve(data)
        }
      })
    })
  }

  let outputDir = moan.task('get-output-dir').result
  let outputFile = path.join(outputDir, moan.config('fileName'))

  return readFile(outputFile, moan.config('encoding'))
    .then((version) => {
      moan.log.ok(`Version: ${version}`)

      return version
    })
})
moan.task('write-async-promise', [ 'clean-async-promise', 'get-output-dir' ], () => {
  function writeFile(filePath, data, encoding) {
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, data, { encoding }, (error) => {
        if (error) {
          reject(error)
        } else {
          resolve(filePath)
        }
      })
    })
  }

  let outputDir = moan.task('get-output-dir').result
  let outputFile = path.join(outputDir, moan.config('fileName'))

  return mkdirpPromise(outputDir)
    .then(() => {
      let version = require('./package.json').version

      return writeFile(outputFile, version, moan.config('encoding'))
    })
})
moan.task('error-async-promise', () => {
  return Promise.reject('Asynchronous failed!')
})

// Asynchronous tasks using callback functions
moan.task('build-async-callback', 'write-async-callback')
moan.task('clean-async-callback', 'get-output-dir', (done) => {
  let outputDir = moan.task('get-output-dir').result

  rimraf(outputDir, done)
})
moan.task('log-asnyc-callback', [ 'build-async-callback', 'get-output-dir' ], (done) => {
  let encoding = moan.config('encoding')
  let outputDir = moan.task('get-output-dir').result
  let outputFile = path.join(outputDir, moan.config('fileName'))

  fs.readFile(filePath, { encoding }, (error, version) => {
    if (error) {
      return done(error)
    }

    moan.log.ok(`Version: ${version}`)

    done(null, version)
  })
})
moan.task('write-async-callback', [ 'clean-async-callback', 'get-output-dir' ], (done) => {
  let encoding = moan.config('encoding')
  let outputDir = moan.task('get-output-dir').result
  let outputFile = path.join(outputDir, moan.config('fileName'))

  mkdirp(outputDir, (error) => {
    if (error) {
      return done(error)
    }

    fs.writeFile(filePath, data, { encoding }, (error) => {
      if (error) {
        return done(error)
      }

      done(null, outputFile)
    })
  })
})
moan.task('error-async-callback', (done) => {
  done(new Error('Asynchronous failed!'))
})

// Synchronous tasks
moan.task('build-sync', 'write-sync')
moan.task('clean-sync', 'get-output-dir', () => {
  let outputDir = moan.task('get-output-dir').result

  rimraf.sync(outputDir)
})
moan.task('log-sync', [ 'build-sync', 'get-output-dir' ], () => {
  let encoding = moan.config('encoding')
  let outputDir = moan.task('get-output-dir').result
  let outputFile = path.join(outputDir, moan.config('fileName'))
  let version = fs.readFileSync(filePath, { encoding })

  moan.log.ok(`Version: ${version}`)

  return version
})
moan.task('write-sync', [ 'clean-sync', 'get-output-dir' ], () => {
  let encoding = moan.config('encoding')
  let outputDir = moan.task('get-output-dir').result
  let outputFile = path.join(outputDir, moan.config('fileName'))

  mkdirp.sync(outpitDir)
  fs.writeFileSync(filePath, data, { encoding })

  return outputFile
})
moan.task('error-sync', () => {
  throw new Error('Asynchronous failed!')
})

// Helper tasks
moan.task('get-output-dir', () => moan.fileSet('outputDir').first())

// Task groups
moan.task('build', [ 'build-async-callback', 'build-async-promise', 'build-sync' ])
moan.task('clean', [ 'clean-async-callback', 'clean-async-promise', 'clean-sync' ])
moan.task('error', [ 'error-asnyc-callback', 'error-async-promise', 'error-sync' ])
moan.task('log', [ 'log-async-callback', 'log-async-promise', 'log-sync' ])

// Default task
moan.task('default', 'build')