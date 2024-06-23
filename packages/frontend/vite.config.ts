import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        compact: true,
        minifyInternalExports: true,
        manualChunks: {
          '@web3-react/base': ['@web3-react/core', '@web3-react/types', '@web3-react/network'],
          '@web3-react/metamask': ['@web3-react/metamask'],
          '@web3-react/coinbase': ['@web3-react/coinbase-wallet'],
          '@trustwallet/web3-react-trust-wallet': ['@trustwallet/web3-react-trust-wallet'],
          '@web3-react/walletconnect-v2': ['@web3-react/walletconnect-v2'],
        },
      },
    },
  },
  resolve: {
    alias: {
      buffer: 'rollup-plugin-node-polyfills/polyfills/buffer-es6',
    },
  },
})
