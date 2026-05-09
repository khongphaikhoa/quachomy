import { useEffect, useRef, useState } from 'react'
import type { MemorySlide } from '../lib/slides'
import { exportPhotoStrip } from '../lib/exportStrip'

type Props = {
  slides: MemorySlide[]
  onDone: () => void
  complete: boolean
  onRestart: () => void
}

export function PhotoStripPrint({ slides, onDone, complete, onRestart }: Props) {
  const [isPrinted, setIsPrinted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const stripRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsPrinted(true)
      onDone()
    }, 1800)
    return () => window.clearTimeout(timer)
  }, [onDone])

  const handleSaveStrip = async () => {
    if (isSaving || !stripRef.current) return
    try {
      setIsSaving(true)
      setIsExporting(true)
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      })
      await exportPhotoStrip(stripRef.current)
    } finally {
      setIsExporting(false)
      setIsSaving(false)
    }
  }

  return (
    <section className="print-stage">
      <div className="print-slot" aria-hidden />
      <article
        ref={stripRef}
        className={`photo-strip ${isPrinted ? 'is-printed' : ''} ${complete ? 'is-complete' : ''} ${isExporting ? 'is-exporting' : ''}`}
      >
        {slides.map((slide) => (
          <figure key={slide.id} className="strip-frame">
            <img src={slide.imageSrc} alt={slide.caption} />
            <figcaption>{slide.caption}</figcaption>
          </figure>
        ))}
        <p className="final-note">cún đáng yêu và mèo đáng ghét</p>
      </article>
      {complete && (
        <div className="strip-actions">
          <button type="button" className="save-strip-btn" onClick={handleSaveStrip} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Photo Strip'}
          </button>
          <button type="button" className="save-strip-btn restart-btn" onClick={onRestart}>
            Start Over
          </button>
        </div>
      )}
    </section>
  )
}
