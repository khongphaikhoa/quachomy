export type PointerSample = {
  x: number
  y: number
  dt: number
}

export type RevealEngineOptions = {
  width: number
  height: number
  lowThreshold?: number
  highThreshold?: number
}

export class RevealEngine {
  readonly width: number
  readonly height: number
  readonly lowThreshold: number
  readonly highThreshold: number
  private readonly exposure: Float32Array
  private readonly colorDelay: Float32Array
  private exposedCount = 0

  constructor(options: RevealEngineOptions) {
    this.width = options.width
    this.height = options.height
    this.lowThreshold = options.lowThreshold ?? 0.2
    this.highThreshold = options.highThreshold ?? 0.7
    this.exposure = new Float32Array(this.width * this.height)
    this.colorDelay = new Float32Array(this.width * this.height)
  }

  reset() {
    this.exposure.fill(0)
    this.colorDelay.fill(0)
    this.exposedCount = 0
  }

  applyBrush(sample: PointerSample, radius: number, strength: number) {
    const minX = Math.max(0, Math.floor(sample.x - radius))
    const maxX = Math.min(this.width - 1, Math.ceil(sample.x + radius))
    const minY = Math.max(0, Math.floor(sample.y - radius))
    const maxY = Math.min(this.height - 1, Math.ceil(sample.y + radius))
    const invRadius = 1 / radius

    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        const dx = x - sample.x
        const dy = y - sample.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        if (distance > radius) continue

        const idx = y * this.width + x
        const feather = 1 - distance * invRadius
        const jitter = 0.92 + Math.random() * 0.12
        const add = feather * feather * strength * jitter * sample.dt
        const before = this.exposure[idx]
        const after = Math.min(1, before + add)
        this.exposure[idx] = after

        if (after > this.lowThreshold && before <= this.lowThreshold) {
          this.exposedCount += 1
        }
        if (after > this.lowThreshold) {
          this.colorDelay[idx] = Math.min(this.colorDelay[idx] + sample.dt, 1.2)
        }
      }
    }
  }

  revealProgress() {
    return this.exposedCount / (this.width * this.height)
  }

  toImageData(target: ImageData) {
    const data = target.data
    for (let i = 0; i < this.exposure.length; i += 1) {
      const exposure = this.exposure[i]
      const delay = this.colorDelay[i]
      const phaseGray = Math.min(1, exposure / this.lowThreshold)
      const phaseColor =
        exposure > this.highThreshold ? Math.min(1, delay / 0.28) : Math.min(1, delay / 0.8) * 0.6
      const boostedAlpha = Math.min(1, Math.pow(exposure, 0.42) * 1.18)

      const base = i * 4
      data[base] = Math.round(phaseColor * 255)
      data[base + 1] = Math.round(phaseGray * 255)
      data[base + 2] = Math.round(phaseGray * 255)
      data[base + 3] = Math.round(boostedAlpha * 255)
    }
  }
}
