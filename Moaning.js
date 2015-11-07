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
moan.config('outputDir', 'temp/')

// File sets
moan.fileSet('clean', moan.config('outputDir'))

// Asynchronous tasks using promises
moan.task('build-async-promise', 'write-async-promise')
moan.task('clean-async-promise', () => {
  return moan.fileSet('clean').del()
})
moan.task('create-output-dir-async-promise', () => {
  return mkdirpPromise(moan.config('outputDir'))
})
moan.task('log-async-promise', 'write-async-promise', () => {
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

  let encoding = moan.config('encoding')
  let outputDir = moan.config('outputDir')
  let outputFile = path.join(outputDir, moan.config('fileName'))

  return readFile(outputFile, encoding)
    .then((version) => {
      moan.log.ok(`Version: ${version}`)

      return version
    })
})
moan.task('write-async-promise', [ 'clean-async-promise', 'create-output-dir-async-promise' ], () => {
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

  let encoding = moan.config('encoding')
  let outputDir = moan.config('outputDir')
  let outputFile = path.join(outputDir, moan.config('fileName'))
  let version = require('./package.json').version

  return writeFile(outputFile, version, encoding)
})
moan.task('error-async-promise', () => {
  return Promise.reject('Asynchronous failed!')
})

// Asynchronous tasks using callback functions
moan.task('build-async-callback', 'write-async-callback')
moan.task('clean-async-callback', (done) => {
  rimraf(moan.config('outputDir'), done)
})
moan.task('create-output-dir-async-callback', (done) => {
  mkdirp(moan.config('outputDir'), done)
})
moan.task('log-async-callback', 'write-async-callback', (done) => {
  let encoding = moan.config('encoding')
  let outputDir = moan.config('outputDir')
  let outputFile = path.join(outputDir, moan.config('fileName'))

  fs.readFile(outputFile, { encoding }, (error, version) => {
    if (error) {
      return done(error)
    }

    moan.log.ok(`Version: ${version}`)

    done(null, version)
  })
})
moan.task('write-async-callback', [ 'clean-async-callback', 'create-output-dir-async-callback' ], (done) => {
  let encoding = moan.config('encoding')
  let outputDir = moan.config('outputDir')
  let outputFile = path.join(outputDir, moan.config('fileName'))
  let version = require('./package.json').version

  fs.writeFile(outputFile, version, { encoding }, (error) => {
    if (error) {
      return done(error)
    }

    done(null, outputFile)
  })
})
moan.task('error-async-callback', (done) => {
  done(new Error('Asynchronous failed!'))
})

// Synchronous tasks
moan.task('build-sync', 'write-sync')
moan.task('clean-sync', () => {
  rimraf.sync(moan.config('outputDir'))
})
moan.task('create-output-dir-sync', () => {
  mkdirp.sync(moan.config('outputDir'))
})
moan.task('log-sync', 'write-sync', () => {
  let encoding = moan.config('encoding')
  let outputDir = moan.config('outputDir')
  let outputFile = path.join(outputDir, moan.config('fileName'))
  let version = fs.readFileSync(outputFile, { encoding })

  moan.log.ok(`Version: ${version}`)

  return version
})
moan.task('write-sync', [ 'clean-sync', 'create-output-dir-sync' ], () => {
  let encoding = moan.config('encoding')
  let outputDir = moan.config('outputDir')
  let outputFile = path.join(outputDir, moan.config('fileName'))
  let version = require('./package.json').version

  fs.writeFileSync(outputFile, version, { encoding })

  return outputFile
})
moan.task('error-sync', () => {
  throw new Error('Asynchronous failed!')
})

// Task groups
moan.task('build', [ 'build-async-callback', 'build-async-promise', 'build-sync' ])
moan.task('clean', [ 'clean-async-callback', 'clean-async-promise', 'clean-sync' ])
moan.task('error', [ 'error-async-callback', 'error-async-promise', 'error-sync' ])
moan.task('log', [ 'log-async-callback', 'log-async-promise', 'log-sync' ])

// Default task
moan.task('default', 'build')