import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  // Resolver problema de compatibilidade com MUI e react-is
  ssr: {
    noExternal: ['@mui/material', '@mui/utils']
  },
  plugins: [
    react(),
    // Plugin para resolver buffer/ e plotly.js problemático
    {
      name: 'fix-plotly-buffer',
      configResolved(config) {
        // Forçar o Vite a não processar plotly.js durante o optimizeDeps
        config.optimizeDeps = config.optimizeDeps || {}
        config.optimizeDeps.exclude = config.optimizeDeps.exclude || []
        if (!config.optimizeDeps.exclude.includes('plotly.js')) {
          config.optimizeDeps.exclude.push('plotly.js')
        }
      },
      resolveId(id) {
        // Resolver buffer/ para buffer
        if (id === 'buffer/') {
          return { id: 'buffer', external: false }
        }
        // Resolver plotly.js/dist/plotly para plotly.js-dist-min
        if (id === 'plotly.js/dist/plotly' || id === 'plotly.js/dist/plotly.min') {
          return { id: 'plotly.js-dist-min', external: false }
        }
        // Resolver plotly.js para plotly.js-dist-min
        if (id === 'plotly.js') {
          return { id: 'plotly.js-dist-min', external: false }
        }
        // Não resolver react-is aqui - deixar o Vite lidar naturalmente
        // Isso evita problemas de bundling
      },
      load(id) {
        // Interceptar require dinâmico de plotly.js/dist/plotly
        if (id === 'plotly.js/dist/plotly' || id === 'plotly.js/dist/plotly.min' || id.includes('plotly.js/dist/plotly')) {
          return `
            import * as PlotlyModule from 'plotly.js-dist-min';
            const Plotly = PlotlyModule.default || PlotlyModule.Plotly || PlotlyModule;
            if (typeof window !== 'undefined') {
              window.Plotly = Plotly;
            }
            export default Plotly;
            export { Plotly };
          `
        }
      },
      transform(code, id) {
        // Apenas transformar durante o build, não durante o dev
        if (process.env.NODE_ENV !== 'production') {
          return null
        }
        
        let modified = false
        let newCode = code
        
        // Transformar apenas isValidElementType de react-is no MUI
        if (id.includes('@mui/utils') && code.includes("isValidElementType") && code.includes("from 'react-is'")) {
          const wrapperPath = resolve(__dirname, 'src/utils/react-is-wrapper.js').replace(/\\/g, '/')
          newCode = newCode.replace(
            /import\s+{\s*([^}]*isValidElementType[^}]*)\s*}\s+from\s+['"]react-is['"]/g,
            `import { $1 } from '${wrapperPath}'`
          )
          modified = true
        }
        
        // Resolver prop-types default export para módulos MUI
        if (id.includes('@mui') && code.includes("import PropTypes from 'prop-types'")) {
          newCode = newCode.replace(
            /import\s+PropTypes\s+from\s+['"]prop-types['"]/g,
            `import * as PropTypesModule from 'prop-types'; const PropTypes = PropTypesModule.default || PropTypesModule;`
          )
          modified = true
        }
        
        // Resolver hoist-non-react-statics default export
        if (id.includes('hoist-non-react-statics') && code.includes("import hoistNonReactStatics")) {
          newCode = newCode.replace(
            /import\s+(\w+)\s+from\s+['"]hoist-non-react-statics['"]/g,
            `import * as HoistModule from 'hoist-non-react-statics'; const $1 = HoistModule.default || HoistModule;`
          )
          modified = true
        }
        
        return modified ? { code: newCode, map: null } : null
      }
    }
  ],
  server: {
    port: 3000,
    host: '0.0.0.0', // Permite acesso via localhost e IP da rede
    open: true,
    strictPort: false
  },
  optimizeDeps: {
    include: ['jspdf', 'html2canvas', 'buffer', 'plotly.js-dist-min', 'react-plotly.js', 'react', 'react-dom', 'react-is'],
    exclude: ['plotly.js'],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },
  define: {
    'process.env': {},
    global: 'globalThis'
  },
  resolve: {
    alias: {
      'buffer': 'buffer',
      'buffer/': 'buffer',
      'plotly.js': 'plotly.js-dist-min',
      'plotly.js/dist/plotly': 'plotly.js-dist-min',
      'plotly.js/dist/plotly.min': 'plotly.js-dist-min'
    },
    dedupe: ['react', 'react-dom', 'react-is']
  },
  build: {
    minify: false,
    sourcemap: true,
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/react-plotly\.js/, /plotly\.js/, /node_modules/],
      defaultIsModuleExports: true,
      esmExternals: false
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Separar vendor chunks evitando dependências circulares
          if (id.includes('node_modules')) {
            // Plotly primeiro (maior e independente)
            if (id.includes('plotly')) {
              return 'plotly-vendor'
            }
            // React core (deve vir antes de MUI)
            if (id.includes('react') && !id.includes('@mui') && !id.includes('@emotion')) {
              return 'react-vendor'
            }
            // MUI e Emotion (dependem de React)
            if (id.includes('@mui') || id.includes('@emotion')) {
              return 'mui-vendor'
            }
          }
        }
      },
      external: [],
      plugins: []
    }
  }
})
