
import buble from 'rollup-plugin-buble'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import alias from 'rollup-plugin-import-alias'

const plugins = [
  alias({
    Paths: {
      '@/src': 'src',
      '@/test': 'test'
    }
  }),

  buble({
    transforms: {
      dangerousForOf: true,
      spreadRest: true
    },
    objectAssign: 'Object.assign'
  }),

  commonjs(),

  resolve()
]

export default [
  {
    input: 'src/domulo/index.js',

    output: {
      name: 'DOMULO-lib',
      file: 'dist/domulo.js',
      format: 'umd'
    },

    plugins
  },

 {
    input: 'test/domulo/app/index.js',

    output: {
      name: 'DOMULO-test-app',
      file: 'dist/domulo-test-app.js',
      format: 'umd'
    },

    plugins
  }
]
