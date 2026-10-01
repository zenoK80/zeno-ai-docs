import type { NextConfig } from 'next'
import nextra from 'nextra'

const withNextra = nextra({
  latex: { renderer: 'katex', options: { strict: false } },
})

const nextConfig: NextConfig = {
  output: 'export',
  experimental: {
    cpus: 1,
    parallelServerBuildTraces: false,
    parallelServerCompiles: false,
    webpackBuildWorker: true,
    webpackMemoryOptimizations: true,
  },
  images: {
    unoptimized: true,
  },
}

export default withNextra(nextConfig)
