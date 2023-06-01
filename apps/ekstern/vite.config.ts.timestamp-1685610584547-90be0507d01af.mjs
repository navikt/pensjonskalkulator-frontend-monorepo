var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw new Error('Dynamic require of "' + x + '" is not supported');
});

// vite.config.ts
import { defineConfig, loadEnv } from "file:///Users/marionhauff/dev/pensjonskalkulator-frontend/node_modules/vite/dist/node/index.js";
import react from "file:///Users/marionhauff/dev/pensjonskalkulator-frontend/node_modules/@vitejs/plugin-react/dist/index.mjs";
import eslint from "file:///Users/marionhauff/dev/pensjonskalkulator-frontend/node_modules/vite-plugin-eslint/dist/index.mjs";
import stylelint from "file:///Users/marionhauff/dev/pensjonskalkulator-frontend/node_modules/vite-plugin-stylelint/dist/index.mjs";
import sassDts from "file:///Users/marionhauff/dev/pensjonskalkulator-frontend/node_modules/vite-plugin-sass-dts/dist/index.js";
import { visualizer } from "file:///Users/marionhauff/dev/pensjonskalkulator-frontend/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";

// scripts/CustomPostCSSLoader.js
import path from "path";
import sass from "file:///Users/marionhauff/dev/pensjonskalkulator-frontend/node_modules/node-sass/lib/index.js";
import postcss from "file:///Users/marionhauff/dev/pensjonskalkulator-frontend/node_modules/postcss/lib/postcss.mjs";
import extractImports from "file:///Users/marionhauff/dev/pensjonskalkulator-frontend/node_modules/postcss-modules-extract-imports/src/index.js";
import localByDefault from "file:///Users/marionhauff/dev/pensjonskalkulator-frontend/node_modules/postcss-modules-local-by-default/src/index.js";
import scope from "file:///Users/marionhauff/dev/pensjonskalkulator-frontend/node_modules/postcss-modules-scope/src/index.js";
import values from "file:///Users/marionhauff/dev/pensjonskalkulator-frontend/node_modules/postcss-modules-values/src/index.js";
var importRegexp = /^:import\((.+)\)$/;
var Parser = class {
  constructor(pathFetcher, trace) {
    this.pathFetcher = pathFetcher;
    this.plugin = this.plugin.bind(this);
    this.exportTokens = {};
    this.translations = {};
    this.trace = trace;
  }
  plugin(css) {
    return Promise.all(this.fetchAllImports(css)).then(
      () => this.extractExports(css)
    );
  }
  fetchAllImports(css) {
    let imports = [];
    css.each((node) => {
      if (node.type === "rule" && node.selector.match(importRegexp)) {
        imports.push(
          this.fetchImport(node, css.source.input.from, imports.length)
        );
      }
    });
    return imports;
  }
  extractExports(css) {
    css.each((node) => {
      if (node.type === "rule" && node.selector === ":export")
        this.handleExport(node);
    });
  }
  handleExport(exportNode) {
    exportNode.each((decl) => {
      if (decl.type === "decl") {
        Object.keys(this.translations).forEach((translation) => {
          decl.value = decl.value.replace(
            translation,
            this.translations[translation]
          );
        });
        this.exportTokens[decl.prop] = decl.value;
      }
    });
    exportNode.remove();
  }
  fetchImport(importNode, relativeTo, depNr) {
    let file = importNode.selector.match(importRegexp)[1], depTrace = this.trace + String.fromCharCode(depNr);
    return this.pathFetcher(file, relativeTo, depTrace).then(
      (exports) => {
        importNode.each((decl) => {
          if (decl.type === "decl") {
            this.translations[decl.prop] = exports[decl.value];
          }
        });
        importNode.remove();
      },
      (err) => console.log(err)
    );
  }
};
var Core = class {
  constructor(plugins) {
    this.plugins = plugins || Core.defaultPlugins;
  }
  load(sourceString, sourcePath, trace, pathFetcher) {
    let parser = new Parser(pathFetcher, trace);
    return postcss(this.plugins.concat([parser.plugin])).process(sourceString, { from: "/" + sourcePath }).then((result) => {
      return {
        injectableSource: result.css,
        exportTokens: parser.exportTokens
      };
    });
  }
};
Core.values = values;
Core.localByDefault = localByDefault;
Core.extractImports = extractImports;
Core.scope = scope;
Core.defaultPlugins = [values, localByDefault, extractImports, scope];
var traceKeySorter = (a, b) => {
  if (a.length < b.length) {
    return a < b.substring(0, a.length) ? -1 : 1;
  } else if (a.length > b.length) {
    return a.substring(0, b.length) <= b ? -1 : 1;
  } else {
    return a < b ? -1 : 1;
  }
};
var CustomPostCSSLoader = class {
  constructor(root, plugins) {
    this.root = root;
    this.sources = {};
    this.traces = {};
    this.importNr = 0;
    this.core = new Core(plugins);
    this.tokensByFile = {};
  }
  fetch(_newPath, relativeTo, _trace) {
    let newPath = _newPath.replace(/^["']|["']$/g, ""), trace = _trace || String.fromCharCode(this.importNr++);
    return new Promise((resolve, reject) => {
      let relativeDir = path.dirname(relativeTo), rootRelativePath = path.resolve(relativeDir, newPath), fileRelativePath = path.resolve(
        path.join(this.root, relativeDir),
        newPath
      );
      if (newPath[0] !== "." && newPath[0] !== "/") {
        try {
          fileRelativePath = __require.resolve(newPath);
        } catch (e) {
          console.log(e);
        }
      }
      const tokens = this.tokensByFile[fileRelativePath];
      if (tokens) {
        return resolve(tokens);
      }
      sass.render({ file: fileRelativePath }, (err, source) => {
        if (err) {
          reject(err);
        }
        this.core.load(
          source.css.toString(),
          rootRelativePath,
          trace,
          this.fetch.bind(this)
        ).then(({ injectableSource, exportTokens }) => {
          this.sources[fileRelativePath] = injectableSource;
          this.traces[trace] = fileRelativePath;
          this.tokensByFile[fileRelativePath] = exportTokens;
          resolve(exportTokens);
        }, reject);
      });
    });
  }
  get finalSource() {
    const traces = this.traces;
    const sources = this.sources;
    let written = /* @__PURE__ */ new Set();
    return Object.keys(traces).sort(traceKeySorter).map((key) => {
      const filename = traces[key];
      if (written.has(filename)) {
        return null;
      }
      written.add(filename);
      return sources[filename];
    }).join("");
  }
};

// vite.config.ts
import path2 from "path";
import tsconfigPaths from "file:///Users/marionhauff/dev/pensjonskalkulator-frontend/node_modules/vite-tsconfig-paths/dist/index.mjs";
var __vite_injected_original_dirname = "/Users/marionhauff/dev/pensjonskalkulator-frontend";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    base: "/pensjon/kalkulator/",
    build: {
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            highcharts: ["highcharts"],
            ["react-redux"]: [
              "react",
              "react-dom",
              "react-redux",
              "redux",
              "redux-thunk",
              "@reduxjs/toolkit",
              "@reduxjs/toolkit/dist/query",
              "react-router-dom"
            ],
            ["intl"]: [
              "react-intl",
              "intl-messageformat",
              "@formatjs/ecma402-abstract",
              "@formatjs/intl",
              "@formatjs/intl-datetimeformat",
              "@formatjs/intl-displaynames",
              "@formatjs/intl-listformat",
              "@formatjs/intl-localematcher",
              "@formatjs/intl-numberformat"
            ]
          }
        }
      }
    },
    plugins: [
      tsconfigPaths(),
      react(),
      eslint(),
      stylelint({ fix: true }),
      htmlPlugin(env),
      sassDts({
        global: {
          generate: true,
          outFile: path2.resolve(__vite_injected_original_dirname, "./src/style.d.ts")
        }
      }),
      visualizer({
        open: true,
        gzipSize: true,
        brotliSize: true,
        filename: "analice.html"
      })
    ],
    server: {
      proxy: {
        "/pensjon/kalkulator/api": {
          target: "https://pensjonskalkulator-backend.ekstern.dev.nav.no",
          changeOrigin: true,
          secure: false
        }
      }
    },
    css: {
      modules: {
        Loader: CustomPostCSSLoader,
        generateScopedName: (name, fileName) => {
          const pathArray = fileName.split("/");
          const fileNameWithExtension = pathArray[pathArray.length - 1];
          const fileNameArray = fileNameWithExtension.split(".");
          return `${fileNameArray[0]}--${name}`;
        }
      },
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/styles" as common;`,
          importer(...args) {
            if (args[0] !== "@/styles") {
              return;
            }
            return {
              file: `${path2.resolve(__vite_injected_original_dirname, "./public")}`
            };
          }
        }
      }
    },
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: "src/test-setup.ts",
      coverage: {
        provider: "c8",
        all: true,
        extension: [".ts", ".tsx"],
        exclude: [
          "vite.config.ts",
          "src/mocks",
          "src/test-utils.tsx",
          "src/**/*.d.ts",
          "src/**/__tests__",
          "src/main.tsx",
          "src/**/index.ts",
          "src/state/hooks.ts",
          "cypress",
          "cypress.config.ts"
        ],
        perFile: true,
        lines: 95,
        functions: 75,
        branches: 95,
        statements: 95,
        reporter: ["json", "html", "text", "text-summary", "cobertura"]
      }
    }
  };
});
function htmlPlugin(env) {
  return {
    name: "html-transform",
    transformIndexHtml: {
      enforce: "pre",
      transform: (html) => html.replace(/%(.*?)%/g, (match, p1) => env[p1] ?? match)
    }
  };
}
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAic2NyaXB0cy9DdXN0b21Qb3N0Q1NTTG9hZGVyLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL21hcmlvbmhhdWZmL2Rldi9wZW5zam9uc2thbGt1bGF0b3ItZnJvbnRlbmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9tYXJpb25oYXVmZi9kZXYvcGVuc2pvbnNrYWxrdWxhdG9yLWZyb250ZW5kL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9tYXJpb25oYXVmZi9kZXYvcGVuc2pvbnNrYWxrdWxhdG9yLWZyb250ZW5kL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSAndml0ZSdcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcbmltcG9ydCBlc2xpbnQgZnJvbSAndml0ZS1wbHVnaW4tZXNsaW50J1xuaW1wb3J0IHN0eWxlbGludCBmcm9tICd2aXRlLXBsdWdpbi1zdHlsZWxpbnQnXG5pbXBvcnQgc2Fzc0R0cyBmcm9tICd2aXRlLXBsdWdpbi1zYXNzLWR0cydcbmltcG9ydCB7IHZpc3VhbGl6ZXIgfSBmcm9tICdyb2xsdXAtcGx1Z2luLXZpc3VhbGl6ZXInXG5pbXBvcnQgQ3VzdG9tUG9zdENTU0xvYWRlciBmcm9tICcuL3NjcmlwdHMvQ3VzdG9tUG9zdENTU0xvYWRlcidcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgdHNjb25maWdQYXRocyBmcm9tICd2aXRlLXRzY29uZmlnLXBhdGhzJ1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuLy8gVE9ETyBtYW51YWxDaHVua3MgZnVuZ2VyZXIgaWtrZSBzb20gZm9ydmVudGV0IC0gcHJcdTAwRjh2ZSBhbHRlcm5hdGl2ZXIgZm9yIGNvZGUgc3BsaXR0aW5nXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiB7XG4gIGNvbnN0IGVudiA9IGxvYWRFbnYobW9kZSwgcHJvY2Vzcy5jd2QoKSwgJycpXG4gIHJldHVybiB7XG4gICAgYmFzZTogJy9wZW5zam9uL2thbGt1bGF0b3IvJyxcbiAgICBidWlsZDoge1xuICAgICAgc291cmNlbWFwOiB0cnVlLFxuICAgICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgICBvdXRwdXQ6IHtcbiAgICAgICAgICBtYW51YWxDaHVua3M6IHtcbiAgICAgICAgICAgIGhpZ2hjaGFydHM6IFsnaGlnaGNoYXJ0cyddLFxuICAgICAgICAgICAgWydyZWFjdC1yZWR1eCddOiBbXG4gICAgICAgICAgICAgICdyZWFjdCcsXG4gICAgICAgICAgICAgICdyZWFjdC1kb20nLFxuICAgICAgICAgICAgICAncmVhY3QtcmVkdXgnLFxuICAgICAgICAgICAgICAncmVkdXgnLFxuICAgICAgICAgICAgICAncmVkdXgtdGh1bmsnLFxuICAgICAgICAgICAgICAnQHJlZHV4anMvdG9vbGtpdCcsXG4gICAgICAgICAgICAgICdAcmVkdXhqcy90b29sa2l0L2Rpc3QvcXVlcnknLFxuICAgICAgICAgICAgICAncmVhY3Qtcm91dGVyLWRvbScsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgWydpbnRsJ106IFtcbiAgICAgICAgICAgICAgJ3JlYWN0LWludGwnLFxuICAgICAgICAgICAgICAnaW50bC1tZXNzYWdlZm9ybWF0JyxcbiAgICAgICAgICAgICAgJ0Bmb3JtYXRqcy9lY21hNDAyLWFic3RyYWN0JyxcbiAgICAgICAgICAgICAgJ0Bmb3JtYXRqcy9pbnRsJyxcbiAgICAgICAgICAgICAgJ0Bmb3JtYXRqcy9pbnRsLWRhdGV0aW1lZm9ybWF0JyxcbiAgICAgICAgICAgICAgJ0Bmb3JtYXRqcy9pbnRsLWRpc3BsYXluYW1lcycsXG4gICAgICAgICAgICAgICdAZm9ybWF0anMvaW50bC1saXN0Zm9ybWF0JyxcbiAgICAgICAgICAgICAgJ0Bmb3JtYXRqcy9pbnRsLWxvY2FsZW1hdGNoZXInLFxuICAgICAgICAgICAgICAnQGZvcm1hdGpzL2ludGwtbnVtYmVyZm9ybWF0JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBwbHVnaW5zOiBbXG4gICAgICB0c2NvbmZpZ1BhdGhzKCksXG4gICAgICByZWFjdCgpLFxuICAgICAgZXNsaW50KCksXG4gICAgICBzdHlsZWxpbnQoeyBmaXg6IHRydWUgfSksXG4gICAgICBodG1sUGx1Z2luKGVudiksXG4gICAgICBzYXNzRHRzKHtcbiAgICAgICAgZ2xvYmFsOiB7XG4gICAgICAgICAgZ2VuZXJhdGU6IHRydWUsXG4gICAgICAgICAgb3V0RmlsZTogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL3N0eWxlLmQudHMnKSxcbiAgICAgICAgfSxcbiAgICAgIH0pLFxuICAgICAgdmlzdWFsaXplcih7XG4gICAgICAgIG9wZW46IHRydWUsXG4gICAgICAgIGd6aXBTaXplOiB0cnVlLFxuICAgICAgICBicm90bGlTaXplOiB0cnVlLFxuICAgICAgICBmaWxlbmFtZTogJ2FuYWxpY2UuaHRtbCcsXG4gICAgICB9KSxcbiAgICBdLFxuICAgIHNlcnZlcjoge1xuICAgICAgcHJveHk6IHtcbiAgICAgICAgJy9wZW5zam9uL2thbGt1bGF0b3IvYXBpJzoge1xuICAgICAgICAgIHRhcmdldDogJ2h0dHBzOi8vcGVuc2pvbnNrYWxrdWxhdG9yLWJhY2tlbmQuZWtzdGVybi5kZXYubmF2Lm5vJyxcbiAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgICAgc2VjdXJlOiBmYWxzZSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBjc3M6IHtcbiAgICAgIG1vZHVsZXM6IHtcbiAgICAgICAgTG9hZGVyOiBDdXN0b21Qb3N0Q1NTTG9hZGVyLFxuICAgICAgICBnZW5lcmF0ZVNjb3BlZE5hbWU6IChuYW1lLCBmaWxlTmFtZSkgPT4ge1xuICAgICAgICAgIGNvbnN0IHBhdGhBcnJheSA9IGZpbGVOYW1lLnNwbGl0KCcvJylcbiAgICAgICAgICBjb25zdCBmaWxlTmFtZVdpdGhFeHRlbnNpb24gPSBwYXRoQXJyYXlbcGF0aEFycmF5Lmxlbmd0aCAtIDFdXG4gICAgICAgICAgY29uc3QgZmlsZU5hbWVBcnJheSA9IGZpbGVOYW1lV2l0aEV4dGVuc2lvbi5zcGxpdCgnLicpXG4gICAgICAgICAgcmV0dXJuIGAke2ZpbGVOYW1lQXJyYXlbMF19LS0ke25hbWV9YFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIHByZXByb2Nlc3Nvck9wdGlvbnM6IHtcbiAgICAgICAgc2Nzczoge1xuICAgICAgICAgIGFkZGl0aW9uYWxEYXRhOiBgQHVzZSBcIkAvc3R5bGVzXCIgYXMgY29tbW9uO2AsXG4gICAgICAgICAgaW1wb3J0ZXIoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKGFyZ3NbMF0gIT09ICdAL3N0eWxlcycpIHtcbiAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBmaWxlOiBgJHtwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9wdWJsaWMnKX1gLFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gICAgdGVzdDoge1xuICAgICAgZW52aXJvbm1lbnQ6ICdqc2RvbScsXG4gICAgICBnbG9iYWxzOiB0cnVlLFxuICAgICAgc2V0dXBGaWxlczogJ3NyYy90ZXN0LXNldHVwLnRzJyxcbiAgICAgIGNvdmVyYWdlOiB7XG4gICAgICAgIHByb3ZpZGVyOiAnYzgnLFxuICAgICAgICBhbGw6IHRydWUsXG4gICAgICAgIGV4dGVuc2lvbjogWycudHMnLCAnLnRzeCddLFxuICAgICAgICBleGNsdWRlOiBbXG4gICAgICAgICAgJ3ZpdGUuY29uZmlnLnRzJyxcbiAgICAgICAgICAnc3JjL21vY2tzJyxcbiAgICAgICAgICAnc3JjL3Rlc3QtdXRpbHMudHN4JyxcbiAgICAgICAgICAnc3JjLyoqLyouZC50cycsXG4gICAgICAgICAgJ3NyYy8qKi9fX3Rlc3RzX18nLFxuICAgICAgICAgICdzcmMvbWFpbi50c3gnLFxuICAgICAgICAgICdzcmMvKiovaW5kZXgudHMnLFxuICAgICAgICAgICdzcmMvc3RhdGUvaG9va3MudHMnLFxuICAgICAgICAgICdjeXByZXNzJyxcbiAgICAgICAgICAnY3lwcmVzcy5jb25maWcudHMnLFxuICAgICAgICBdLFxuICAgICAgICBwZXJGaWxlOiB0cnVlLFxuICAgICAgICBsaW5lczogOTUsXG4gICAgICAgIGZ1bmN0aW9uczogNzUsXG4gICAgICAgIGJyYW5jaGVzOiA5NSxcbiAgICAgICAgc3RhdGVtZW50czogOTUsXG4gICAgICAgIHJlcG9ydGVyOiBbJ2pzb24nLCAnaHRtbCcsICd0ZXh0JywgJ3RleHQtc3VtbWFyeScsICdjb2JlcnR1cmEnXSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfVxufSlcblxuLyoqXG4gKiBSZXBsYWNlIGVudiB2YXJpYWJsZXMgaW4gaW5kZXguaHRtbFxuICogQHNlZSBodHRwczovL2dpdGh1Yi5jb20vdml0ZWpzL3ZpdGUvaXNzdWVzLzMxMDUjaXNzdWVjb21tZW50LTkzOTcwMzc4MVxuICogQHNlZSBodHRwczovL3ZpdGVqcy5kZXYvZ3VpZGUvYXBpLXBsdWdpbi5odG1sI3RyYW5zZm9ybWluZGV4aHRtbFxuICovXG5mdW5jdGlvbiBodG1sUGx1Z2luKGVudjogUmV0dXJuVHlwZTx0eXBlb2YgbG9hZEVudj4pIHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnaHRtbC10cmFuc2Zvcm0nLFxuICAgIHRyYW5zZm9ybUluZGV4SHRtbDoge1xuICAgICAgZW5mb3JjZTogJ3ByZScgYXMgY29uc3QsXG4gICAgICB0cmFuc2Zvcm06IChodG1sOiBzdHJpbmcpOiBzdHJpbmcgPT5cbiAgICAgICAgaHRtbC5yZXBsYWNlKC8lKC4qPyklL2csIChtYXRjaCwgcDEpID0+IGVudltwMV0gPz8gbWF0Y2gpLFxuICAgIH0sXG4gIH1cbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL21hcmlvbmhhdWZmL2Rldi9wZW5zam9uc2thbGt1bGF0b3ItZnJvbnRlbmQvc2NyaXB0c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL21hcmlvbmhhdWZmL2Rldi9wZW5zam9uc2thbGt1bGF0b3ItZnJvbnRlbmQvc2NyaXB0cy9DdXN0b21Qb3N0Q1NTTG9hZGVyLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9tYXJpb25oYXVmZi9kZXYvcGVuc2pvbnNrYWxrdWxhdG9yLWZyb250ZW5kL3NjcmlwdHMvQ3VzdG9tUG9zdENTU0xvYWRlci5qc1wiO2ltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5cbmltcG9ydCBzYXNzIGZyb20gJ25vZGUtc2FzcydcbmltcG9ydCBwb3N0Y3NzIGZyb20gJ3Bvc3Rjc3MnXG5pbXBvcnQgZXh0cmFjdEltcG9ydHMgZnJvbSAncG9zdGNzcy1tb2R1bGVzLWV4dHJhY3QtaW1wb3J0cydcbmltcG9ydCBsb2NhbEJ5RGVmYXVsdCBmcm9tICdwb3N0Y3NzLW1vZHVsZXMtbG9jYWwtYnktZGVmYXVsdCdcbmltcG9ydCBzY29wZSBmcm9tICdwb3N0Y3NzLW1vZHVsZXMtc2NvcGUnXG5pbXBvcnQgdmFsdWVzIGZyb20gJ3Bvc3Rjc3MtbW9kdWxlcy12YWx1ZXMnXG5cbmNvbnN0IGltcG9ydFJlZ2V4cCA9IC9eOmltcG9ydFxcKCguKylcXCkkL1xuXG4vLyBUT0RPIC0gRGVubmUgY3VzdG9tIGxvYWRlciBlciBuXHUwMEY4ZHZlbmRpZyBmb3IgYXQgc2NzcyBmaWxlciBzb20gaW1wb3J0ZXJlcyBnamVubm9tIENTUyBcImNvbXBvc2VcIiBibGlyIHByZS1wcm9zZXNzZXJ0XG4vLyBEZW5uZSBrb2RlbiBrYW4gZmFzZXMgdXQgblx1MDBFNXIgYnVnZydlbiBpIHZpdGUgZXIgbFx1MDBGOHN0LiBcIkxvYWRlclwiIGkgdml0ZS1jb25maWcgc2thbCBvZ3NcdTAwRTUgZmplcm5lcy5cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS92aXRlanMvdml0ZS9pc3N1ZXMvMTAzNDAgb2cgaHR0cHM6Ly9naXRodWIuY29tL3ZpdGVqcy92aXRlL2lzc3Vlcy8xMDA3OVxuLy8gRlx1MDBGOGxnZW5kZSBwYWtrZXIgc2thbCBvZ3NcdTAwRTUgZmplcm5lcyBmcmEgcGFja2FnZS5qc29uOiBub2RlLXNhc3MsIHBvc3Rjc3MtbW9kdWxlcy1leHRyYWN0LWltcG9ydHMsIHBvc3Rjc3MtbW9kdWxlcy1sb2NhbC1ieS1kZWZhdWx0LCBwb3N0Y3NzLW1vZHVsZXMtc2NvcGUsIHBvc3Rjc3MtbW9kdWxlcy12YWx1ZXNcblxuLy8gUGFyc2VyIGNsYXNzIGVyIGtvcGllcnQgZnJhIGh0dHBzOi8vZ2l0aHViLmNvbS9jc3MtbW9kdWxlcy9jc3MtbW9kdWxlcy1sb2FkZXItY29yZS9ibG9iL21hc3Rlci9zcmMvcGFyc2VyLmpzXG5jbGFzcyBQYXJzZXIge1xuICBjb25zdHJ1Y3RvcihwYXRoRmV0Y2hlciwgdHJhY2UpIHtcbiAgICB0aGlzLnBhdGhGZXRjaGVyID0gcGF0aEZldGNoZXJcbiAgICB0aGlzLnBsdWdpbiA9IHRoaXMucGx1Z2luLmJpbmQodGhpcylcbiAgICB0aGlzLmV4cG9ydFRva2VucyA9IHt9XG4gICAgdGhpcy50cmFuc2xhdGlvbnMgPSB7fVxuICAgIHRoaXMudHJhY2UgPSB0cmFjZVxuICB9XG5cbiAgcGx1Z2luKGNzcykge1xuICAgIHJldHVybiBQcm9taXNlLmFsbCh0aGlzLmZldGNoQWxsSW1wb3J0cyhjc3MpKS50aGVuKCgpID0+XG4gICAgICB0aGlzLmV4dHJhY3RFeHBvcnRzKGNzcylcbiAgICApXG4gIH1cblxuICBmZXRjaEFsbEltcG9ydHMoY3NzKSB7XG4gICAgbGV0IGltcG9ydHMgPSBbXVxuICAgIGNzcy5lYWNoKChub2RlKSA9PiB7XG4gICAgICBpZiAobm9kZS50eXBlID09PSAncnVsZScgJiYgbm9kZS5zZWxlY3Rvci5tYXRjaChpbXBvcnRSZWdleHApKSB7XG4gICAgICAgIGltcG9ydHMucHVzaChcbiAgICAgICAgICB0aGlzLmZldGNoSW1wb3J0KG5vZGUsIGNzcy5zb3VyY2UuaW5wdXQuZnJvbSwgaW1wb3J0cy5sZW5ndGgpXG4gICAgICAgIClcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiBpbXBvcnRzXG4gIH1cblxuICBleHRyYWN0RXhwb3J0cyhjc3MpIHtcbiAgICBjc3MuZWFjaCgobm9kZSkgPT4ge1xuICAgICAgaWYgKG5vZGUudHlwZSA9PT0gJ3J1bGUnICYmIG5vZGUuc2VsZWN0b3IgPT09ICc6ZXhwb3J0JylcbiAgICAgICAgdGhpcy5oYW5kbGVFeHBvcnQobm9kZSlcbiAgICB9KVxuICB9XG5cbiAgaGFuZGxlRXhwb3J0KGV4cG9ydE5vZGUpIHtcbiAgICBleHBvcnROb2RlLmVhY2goKGRlY2wpID0+IHtcbiAgICAgIGlmIChkZWNsLnR5cGUgPT09ICdkZWNsJykge1xuICAgICAgICBPYmplY3Qua2V5cyh0aGlzLnRyYW5zbGF0aW9ucykuZm9yRWFjaCgodHJhbnNsYXRpb24pID0+IHtcbiAgICAgICAgICBkZWNsLnZhbHVlID0gZGVjbC52YWx1ZS5yZXBsYWNlKFxuICAgICAgICAgICAgdHJhbnNsYXRpb24sXG4gICAgICAgICAgICB0aGlzLnRyYW5zbGF0aW9uc1t0cmFuc2xhdGlvbl1cbiAgICAgICAgICApXG4gICAgICAgIH0pXG4gICAgICAgIHRoaXMuZXhwb3J0VG9rZW5zW2RlY2wucHJvcF0gPSBkZWNsLnZhbHVlXG4gICAgICB9XG4gICAgfSlcbiAgICBleHBvcnROb2RlLnJlbW92ZSgpXG4gIH1cblxuICBmZXRjaEltcG9ydChpbXBvcnROb2RlLCByZWxhdGl2ZVRvLCBkZXBOcikge1xuICAgIGxldCBmaWxlID0gaW1wb3J0Tm9kZS5zZWxlY3Rvci5tYXRjaChpbXBvcnRSZWdleHApWzFdLFxuICAgICAgZGVwVHJhY2UgPSB0aGlzLnRyYWNlICsgU3RyaW5nLmZyb21DaGFyQ29kZShkZXBOcilcbiAgICByZXR1cm4gdGhpcy5wYXRoRmV0Y2hlcihmaWxlLCByZWxhdGl2ZVRvLCBkZXBUcmFjZSkudGhlbihcbiAgICAgIChleHBvcnRzKSA9PiB7XG4gICAgICAgIGltcG9ydE5vZGUuZWFjaCgoZGVjbCkgPT4ge1xuICAgICAgICAgIGlmIChkZWNsLnR5cGUgPT09ICdkZWNsJykge1xuICAgICAgICAgICAgdGhpcy50cmFuc2xhdGlvbnNbZGVjbC5wcm9wXSA9IGV4cG9ydHNbZGVjbC52YWx1ZV1cbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIGltcG9ydE5vZGUucmVtb3ZlKClcbiAgICAgIH0sXG4gICAgICAoZXJyKSA9PiBjb25zb2xlLmxvZyhlcnIpXG4gICAgKVxuICB9XG59XG5cbi8vIFBvc3Rjc3MgQ29yZSBMb2FkZXIgZXIga29waWVydCBmcmEgaHR0cHM6Ly9naXRodWIuY29tL2Nzcy1tb2R1bGVzL2Nzcy1tb2R1bGVzLWxvYWRlci1jb3JlL2Jsb2IvbWFzdGVyL3NyYy9pbmRleC5qc1xuY2xhc3MgQ29yZSB7XG4gIGNvbnN0cnVjdG9yKHBsdWdpbnMpIHtcbiAgICB0aGlzLnBsdWdpbnMgPSBwbHVnaW5zIHx8IENvcmUuZGVmYXVsdFBsdWdpbnNcbiAgfVxuXG4gIGxvYWQoc291cmNlU3RyaW5nLCBzb3VyY2VQYXRoLCB0cmFjZSwgcGF0aEZldGNoZXIpIHtcbiAgICBsZXQgcGFyc2VyID0gbmV3IFBhcnNlcihwYXRoRmV0Y2hlciwgdHJhY2UpXG5cbiAgICByZXR1cm4gcG9zdGNzcyh0aGlzLnBsdWdpbnMuY29uY2F0KFtwYXJzZXIucGx1Z2luXSkpXG4gICAgICAucHJvY2Vzcyhzb3VyY2VTdHJpbmcsIHsgZnJvbTogJy8nICsgc291cmNlUGF0aCB9KVxuICAgICAgLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGluamVjdGFibGVTb3VyY2U6IHJlc3VsdC5jc3MsXG4gICAgICAgICAgZXhwb3J0VG9rZW5zOiBwYXJzZXIuZXhwb3J0VG9rZW5zLFxuICAgICAgICB9XG4gICAgICB9KVxuICB9XG59XG5cbkNvcmUudmFsdWVzID0gdmFsdWVzXG5Db3JlLmxvY2FsQnlEZWZhdWx0ID0gbG9jYWxCeURlZmF1bHRcbkNvcmUuZXh0cmFjdEltcG9ydHMgPSBleHRyYWN0SW1wb3J0c1xuQ29yZS5zY29wZSA9IHNjb3BlXG5cbkNvcmUuZGVmYXVsdFBsdWdpbnMgPSBbdmFsdWVzLCBsb2NhbEJ5RGVmYXVsdCwgZXh0cmFjdEltcG9ydHMsIHNjb3BlXVxuXG4vLyBodHRwczovL2dpdGh1Yi5jb20vY3NzLW1vZHVsZXMvY3NzLW1vZHVsZXMtbG9hZGVyLWNvcmUvYmxvYi9tYXN0ZXIvc3JjL2ZpbGUtc3lzdGVtLWxvYWRlci5qc1xuY29uc3QgdHJhY2VLZXlTb3J0ZXIgPSAoYSwgYikgPT4ge1xuICBpZiAoYS5sZW5ndGggPCBiLmxlbmd0aCkge1xuICAgIHJldHVybiBhIDwgYi5zdWJzdHJpbmcoMCwgYS5sZW5ndGgpID8gLTEgOiAxXG4gIH0gZWxzZSBpZiAoYS5sZW5ndGggPiBiLmxlbmd0aCkge1xuICAgIHJldHVybiBhLnN1YnN0cmluZygwLCBiLmxlbmd0aCkgPD0gYiA/IC0xIDogMVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBhIDwgYiA/IC0xIDogMVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEN1c3RvbVBvc3RDU1NMb2FkZXIge1xuICBjb25zdHJ1Y3Rvcihyb290LCBwbHVnaW5zKSB7XG4gICAgdGhpcy5yb290ID0gcm9vdFxuICAgIHRoaXMuc291cmNlcyA9IHt9XG4gICAgdGhpcy50cmFjZXMgPSB7fVxuICAgIHRoaXMuaW1wb3J0TnIgPSAwXG4gICAgdGhpcy5jb3JlID0gbmV3IENvcmUocGx1Z2lucylcbiAgICB0aGlzLnRva2Vuc0J5RmlsZSA9IHt9XG4gIH1cblxuICBmZXRjaChfbmV3UGF0aCwgcmVsYXRpdmVUbywgX3RyYWNlKSB7XG4gICAgbGV0IG5ld1BhdGggPSBfbmV3UGF0aC5yZXBsYWNlKC9eW1wiJ118W1wiJ10kL2csICcnKSxcbiAgICAgIHRyYWNlID0gX3RyYWNlIHx8IFN0cmluZy5mcm9tQ2hhckNvZGUodGhpcy5pbXBvcnROcisrKVxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBsZXQgcmVsYXRpdmVEaXIgPSBwYXRoLmRpcm5hbWUocmVsYXRpdmVUbyksXG4gICAgICAgIHJvb3RSZWxhdGl2ZVBhdGggPSBwYXRoLnJlc29sdmUocmVsYXRpdmVEaXIsIG5ld1BhdGgpLFxuICAgICAgICBmaWxlUmVsYXRpdmVQYXRoID0gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgIHBhdGguam9pbih0aGlzLnJvb3QsIHJlbGF0aXZlRGlyKSxcbiAgICAgICAgICBuZXdQYXRoXG4gICAgICAgIClcblxuICAgICAgLy8gaWYgdGhlIHBhdGggaXMgbm90IHJlbGF0aXZlIG9yIGFic29sdXRlLCB0cnkgdG8gcmVzb2x2ZSBpdCBpbiBub2RlX21vZHVsZXNcbiAgICAgIGlmIChuZXdQYXRoWzBdICE9PSAnLicgJiYgbmV3UGF0aFswXSAhPT0gJy8nKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgZmlsZVJlbGF0aXZlUGF0aCA9IHJlcXVpcmUucmVzb2x2ZShuZXdQYXRoKVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coZSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb25zdCB0b2tlbnMgPSB0aGlzLnRva2Vuc0J5RmlsZVtmaWxlUmVsYXRpdmVQYXRoXVxuICAgICAgaWYgKHRva2Vucykge1xuICAgICAgICByZXR1cm4gcmVzb2x2ZSh0b2tlbnMpXG4gICAgICB9XG5cbiAgICAgIC8vIEN1c3RvbSBrb2RlIGZzLnJlYWRGaWxlIGVyIGVyc3RhdHRldCBtZWQgc2FzcyBmb3IgcHJlcHJvY2Vzc2luZ1xuICAgICAgc2Fzcy5yZW5kZXIoeyBmaWxlOiBmaWxlUmVsYXRpdmVQYXRoIH0sIChlcnIsIHNvdXJjZSkgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgcmVqZWN0KGVycilcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNvcmVcbiAgICAgICAgICAubG9hZChcbiAgICAgICAgICAgIHNvdXJjZS5jc3MudG9TdHJpbmcoKSxcbiAgICAgICAgICAgIHJvb3RSZWxhdGl2ZVBhdGgsXG4gICAgICAgICAgICB0cmFjZSxcbiAgICAgICAgICAgIHRoaXMuZmV0Y2guYmluZCh0aGlzKVxuICAgICAgICAgIClcbiAgICAgICAgICAudGhlbigoeyBpbmplY3RhYmxlU291cmNlLCBleHBvcnRUb2tlbnMgfSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zb3VyY2VzW2ZpbGVSZWxhdGl2ZVBhdGhdID0gaW5qZWN0YWJsZVNvdXJjZVxuICAgICAgICAgICAgdGhpcy50cmFjZXNbdHJhY2VdID0gZmlsZVJlbGF0aXZlUGF0aFxuICAgICAgICAgICAgdGhpcy50b2tlbnNCeUZpbGVbZmlsZVJlbGF0aXZlUGF0aF0gPSBleHBvcnRUb2tlbnNcbiAgICAgICAgICAgIHJlc29sdmUoZXhwb3J0VG9rZW5zKVxuICAgICAgICAgIH0sIHJlamVjdClcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIGdldCBmaW5hbFNvdXJjZSgpIHtcbiAgICBjb25zdCB0cmFjZXMgPSB0aGlzLnRyYWNlc1xuICAgIGNvbnN0IHNvdXJjZXMgPSB0aGlzLnNvdXJjZXNcbiAgICBsZXQgd3JpdHRlbiA9IG5ldyBTZXQoKVxuXG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRyYWNlcylcbiAgICAgIC5zb3J0KHRyYWNlS2V5U29ydGVyKVxuICAgICAgLm1hcCgoa2V5KSA9PiB7XG4gICAgICAgIGNvbnN0IGZpbGVuYW1lID0gdHJhY2VzW2tleV1cbiAgICAgICAgaWYgKHdyaXR0ZW4uaGFzKGZpbGVuYW1lKSkge1xuICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIH1cbiAgICAgICAgd3JpdHRlbi5hZGQoZmlsZW5hbWUpXG5cbiAgICAgICAgcmV0dXJuIHNvdXJjZXNbZmlsZW5hbWVdXG4gICAgICB9KVxuICAgICAgLmpvaW4oJycpXG4gIH1cbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7OztBQUF3VSxTQUFTLGNBQWMsZUFBZTtBQUM5VyxPQUFPLFdBQVc7QUFDbEIsT0FBTyxZQUFZO0FBQ25CLE9BQU8sZUFBZTtBQUN0QixPQUFPLGFBQWE7QUFDcEIsU0FBUyxrQkFBa0I7OztBQ0xxVixPQUFPLFVBQVU7QUFFalksT0FBTyxVQUFVO0FBQ2pCLE9BQU8sYUFBYTtBQUNwQixPQUFPLG9CQUFvQjtBQUMzQixPQUFPLG9CQUFvQjtBQUMzQixPQUFPLFdBQVc7QUFDbEIsT0FBTyxZQUFZO0FBRW5CLElBQU0sZUFBZTtBQVFyQixJQUFNLFNBQU4sTUFBYTtBQUFBLEVBQ1gsWUFBWSxhQUFhLE9BQU87QUFDOUIsU0FBSyxjQUFjO0FBQ25CLFNBQUssU0FBUyxLQUFLLE9BQU8sS0FBSyxJQUFJO0FBQ25DLFNBQUssZUFBZSxDQUFDO0FBQ3JCLFNBQUssZUFBZSxDQUFDO0FBQ3JCLFNBQUssUUFBUTtBQUFBLEVBQ2Y7QUFBQSxFQUVBLE9BQU8sS0FBSztBQUNWLFdBQU8sUUFBUSxJQUFJLEtBQUssZ0JBQWdCLEdBQUcsQ0FBQyxFQUFFO0FBQUEsTUFBSyxNQUNqRCxLQUFLLGVBQWUsR0FBRztBQUFBLElBQ3pCO0FBQUEsRUFDRjtBQUFBLEVBRUEsZ0JBQWdCLEtBQUs7QUFDbkIsUUFBSSxVQUFVLENBQUM7QUFDZixRQUFJLEtBQUssQ0FBQyxTQUFTO0FBQ2pCLFVBQUksS0FBSyxT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
