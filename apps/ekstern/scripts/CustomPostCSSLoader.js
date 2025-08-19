/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return, @typescript-eslint/unbound-method */
import path from 'path'
import postcss from 'postcss'
import extractImports from 'postcss-modules-extract-imports'
import localByDefault from 'postcss-modules-local-by-default'
import scope from 'postcss-modules-scope'
import values from 'postcss-modules-values'
import * as sass from 'sass-embedded'

const importRegexp = /^:import\((.+)\)$/

// TODO - Denne custom loader er nødvendig for at scss filer som importeres gjennom CSS "compose" blir pre-prosessert
// * Denne koden kan fases ut når bugg'en i vite er løst. "Loader" i vite-config skal også fjernes.
// * https://github.com/vitejs/vite/issues/10340 og https://github.com/vitejs/vite/issues/10079
// * Følgende pakker skal også fjernes fra package.json: postcss-modules-extract-imports, postcss-modules-local-by-default, postcss-modules-scope, postcss-modules-values

// * Parser class er kopiert fra https://github.com/css-modules/css-modules-loader-core/blob/master/src/parser.js
class Parser {
  constructor(pathFetcher, trace) {
    this.pathFetcher = pathFetcher
    this.plugin = this.plugin.bind(this)
    this.exportTokens = {}
    this.translations = {}
    this.trace = trace
  }

  plugin(css) {
    return Promise.all(this.fetchAllImports(css)).then(() =>
      this.extractExports(css)
    )
  }

  fetchAllImports(css) {
    let imports = []
    css.each((node) => {
      if (node.type === 'rule' && node.selector.match(importRegexp)) {
        imports.push(
          this.fetchImport(node, css.source.input.from, imports.length)
        )
      }
    })
    return imports
  }

  extractExports(css) {
    css.each((node) => {
      if (node.type === 'rule' && node.selector === ':export')
        this.handleExport(node)
    })
  }

  handleExport(exportNode) {
    exportNode.each((decl) => {
      if (decl.type === 'decl') {
        Object.keys(this.translations).forEach((translation) => {
          decl.value = decl.value.replace(
            translation,
            this.translations[translation]
          )
        })
        this.exportTokens[decl.prop] = decl.value
      }
    })
    exportNode.remove()
  }

  fetchImport(importNode, relativeTo, depNr) {
    let file = importNode.selector.match(importRegexp)[1],
      depTrace = this.trace + String.fromCharCode(depNr)
    return this.pathFetcher(file, relativeTo, depTrace).then(
      (exports) => {
        importNode.each((decl) => {
          if (decl.type === 'decl') {
            this.translations[decl.prop] = exports[decl.value]
          }
        })
        importNode.remove()
      },
      (err) => console.log(err)
    )
  }
}

// Postcss Core Loader er kopiert fra https://github.com/css-modules/css-modules-loader-core/blob/master/src/index.js
class Core {
  constructor(plugins) {
    this.plugins = plugins || Core.defaultPlugins
  }

  load(sourceString, sourcePath, trace, pathFetcher) {
    let parser = new Parser(pathFetcher, trace)

    return postcss(this.plugins.concat([parser.plugin]))
      .process(sourceString, { from: '/' + sourcePath })
      .then((result) => {
        return {
          injectableSource: result.css,
          exportTokens: parser.exportTokens,
        }
      })
  }
}

Core.values = values
Core.localByDefault = localByDefault
Core.extractImports = extractImports
Core.scope = scope

Core.defaultPlugins = [values, localByDefault, extractImports, scope]

// https://github.com/css-modules/css-modules-loader-core/blob/master/src/file-system-loader.js
const traceKeySorter = (a, b) => {
  if (a.length < b.length) {
    return a < b.substring(0, a.length) ? -1 : 1
  } else if (a.length > b.length) {
    return a.substring(0, b.length) <= b ? -1 : 1
  } else {
    return a < b ? -1 : 1
  }
}

export default class CustomPostCSSLoader {
  constructor(root, plugins) {
    this.root = root
    this.sources = {}
    this.traces = {}
    this.importNr = 0
    this.core = new Core(plugins)
    this.tokensByFile = {}
  }

  fetch(_newPath, relativeTo, _trace) {
    let newPath = _newPath.replace(/^["']|["']$/g, ''),
      trace = _trace || String.fromCharCode(this.importNr++)
    return new Promise((resolve, reject) => {
      let relativeDir = path.dirname(relativeTo),
        rootRelativePath = path.resolve(relativeDir, newPath),
        fileRelativePath = rootRelativePath

      // if the path is not relative or absolute, try to resolve it in node_modules
      if (newPath[0] !== '.' && newPath[0] !== '/') {
        try {
          fileRelativePath = require.resolve(newPath)
        } catch (e) {
          console.log(e)
        }
      }

      const tokens = this.tokensByFile[fileRelativePath]
      if (tokens) {
        return resolve(tokens)
      }

      // Custom kode fs.readFile er erstattet med sass for preprocessing
      sass
        .compileAsync(fileRelativePath, {
          style: 'expanded',
          sourceMap: false,
        })
        .then((result) => {
          this.core
            .load(
              result.css.toString(),
              rootRelativePath.replaceAll('\\', '/'), // Hack: Erstatt Windows path separator med Unix
              trace,
              this.fetch.bind(this)
            )
            .then(({ injectableSource, exportTokens }) => {
              this.sources[fileRelativePath] = injectableSource
              this.traces[trace] = fileRelativePath
              this.tokensByFile[fileRelativePath] = exportTokens
              resolve(exportTokens)
            }, reject)
        })
        .catch(reject)
    })
  }

  get finalSource() {
    const traces = this.traces
    const sources = this.sources
    let written = new Set()

    return Object.keys(traces)
      .sort(traceKeySorter)
      .map((key) => {
        const filename = traces[key]
        if (written.has(filename)) {
          return null
        }
        written.add(filename)

        return sources[filename]
      })
      .join('')
  }
}
