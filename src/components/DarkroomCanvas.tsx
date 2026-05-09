import { useEffect, useMemo, useRef, useState } from 'react'
import type { MemorySlide } from '../lib/slides'
import { RevealEngine } from '../lib/revealEngine'

type Props = {
  slide: MemorySlide
  slideNumber: number
  totalSlides: number
  onComplete: () => void
}

const BASE_WIDTH = 960
const BASE_HEIGHT = 600
const COMPLETE_THRESHOLD = 0.477

export function DarkroomCanvas({ slide, slideNumber, totalSlides, onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [hintVisible, setHintVisible] = useState(true)
  const completedRef = useRef(false)
  const pointerRef = useRef({ x: BASE_WIDTH * 0.5, y: BASE_HEIGHT * 0.5 })
  const easedPointerRef = useRef({ x: BASE_WIDTH * 0.5, y: BASE_HEIGHT * 0.5 })
  const engine = useMemo(() => new RevealEngine({ width: BASE_WIDTH, height: BASE_HEIGHT }), [])

  useEffect(() => {
    completedRef.current = false
    setHintVisible(true)
  }, [slide.id])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let prev = performance.now()
    const revealMap = ctx.createImageData(BASE_WIDTH, BASE_HEIGHT)
    const maskCanvas = document.createElement('canvas')
    maskCanvas.width = BASE_WIDTH
    maskCanvas.height = BASE_HEIGHT
    const maskCtx = maskCanvas.getContext('2d')
    if (!maskCtx) return
    const layerCanvas = document.createElement('canvas')
    layerCanvas.width = BASE_WIDTH
    layerCanvas.height = BASE_HEIGHT
    const layerCtx = layerCanvas.getContext('2d')
    if (!layerCtx) return
    const image = new Image()
    image.src = slide.imageSrc

    const onMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = ((event.clientX - rect.left) / rect.width) * BASE_WIDTH
      const y = ((event.clientY - rect.top) / rect.height) * BASE_HEIGHT
      pointerRef.current = { x, y }
      setHintVisible(false)
    }

    canvas.addEventListener('pointermove', onMove)

    const draw = (now: number) => {
      const dt = Math.min((now - prev) / 1000, 0.05)
      prev = now

      const jitterX = (Math.random() - 0.5) * 0.9
      const jitterY = (Math.random() - 0.5) * 0.9
      easedPointerRef.current.x += (pointerRef.current.x - easedPointerRef.current.x) * 0.12 + jitterX
      easedPointerRef.current.y += (pointerRef.current.y - easedPointerRef.current.y) * 0.12 + jitterY

      engine.applyBrush(
        {
          x: easedPointerRef.current.x,
          y: easedPointerRef.current.y,
          dt,
        },
        90,
        3.19
      )

      engine.toImageData(revealMap)
      maskCtx.putImageData(revealMap, 0, 0)

      ctx.clearRect(0, 0, BASE_WIDTH, BASE_HEIGHT)
      ctx.fillStyle = '#080204'
      ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT)
      ctx.fillStyle = 'rgba(8, 4, 6, 0.82)'
      ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT)

      if (image.complete && image.naturalWidth > 0) {
        layerCtx.clearRect(0, 0, BASE_WIDTH, BASE_HEIGHT)
        layerCtx.save()
        layerCtx.filter = 'grayscale(0.9) contrast(1.25) brightness(0.95)'
        layerCtx.drawImage(image, 0, 0, BASE_WIDTH, BASE_HEIGHT)
        layerCtx.globalCompositeOperation = 'destination-in'
        layerCtx.drawImage(maskCanvas, 0, 0)
        layerCtx.restore()
        ctx.drawImage(layerCanvas, 0, 0)

        layerCtx.clearRect(0, 0, BASE_WIDTH, BASE_HEIGHT)
        layerCtx.save()
        layerCtx.filter = 'saturate(1.2) contrast(1.1) brightness(1.02)'
        layerCtx.drawImage(image, 0, 0, BASE_WIDTH, BASE_HEIGHT)
        layerCtx.globalCompositeOperation = 'source-atop'
        layerCtx.fillStyle = 'rgba(255, 148, 124, 0.58)'
        layerCtx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT)
        layerCtx.globalCompositeOperation = 'destination-in'
        layerCtx.drawImage(maskCanvas, 0, 0)
        layerCtx.restore()
        ctx.globalAlpha = 0.9
        ctx.drawImage(layerCanvas, 0, 0)
        ctx.globalAlpha = 1
      }

      const radial = ctx.createRadialGradient(
        easedPointerRef.current.x,
        easedPointerRef.current.y,
        10,
        easedPointerRef.current.x,
        easedPointerRef.current.y,
        160
      )
      radial.addColorStop(0, 'rgba(255, 245, 235, 0.98)')
      radial.addColorStop(0.4, 'rgba(255, 155, 142, 0.42)')
      radial.addColorStop(1, 'rgba(255, 130, 100, 0)')
      ctx.fillStyle = radial
      ctx.beginPath()
      ctx.arc(easedPointerRef.current.x, easedPointerRef.current.y, 165, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalCompositeOperation = 'source-over'

      const progress = engine.revealProgress()
      if (progress >= COMPLETE_THRESHOLD && !completedRef.current) {
        completedRef.current = true
        window.setTimeout(onComplete, 340)
      }

      raf = requestAnimationFrame(draw)
    }

    const start = () => {
      engine.reset()
      raf = requestAnimationFrame(draw)
    }

    image.onload = start
    image.onerror = () => {
      // Keep render loop alive even if the image path fails to load.
      engine.reset()
      raf = requestAnimationFrame(draw)
    }
    if (image.complete) start()

    return () => {
      cancelAnimationFrame(raf)
      canvas.removeEventListener('pointermove', onMove)
    }
  }, [engine, onComplete, slide.imageSrc])

  return (
    <section className="darkroom-stage">
      <div className="slide-meta">
        <span>{`Slide ${slideNumber}/${totalSlides}`}</span>
        <span>{slide.caption}</span>
      </div>
      <canvas ref={canvasRef} width={BASE_WIDTH} height={BASE_HEIGHT} className="darkroom-canvas" />
      <div className="memory-overlay">
        <p>{slide.note}</p>
        <p className="doodle">{slide.doodle}</p>
      </div>
      {hintVisible && <p className="cursor-hint">Move slowly to develop the memory.</p>}
    </section>
  )
}
