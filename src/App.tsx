import { useMemo, useState } from 'react'
import { DarkroomCanvas } from './components/DarkroomCanvas'
import { PhotoStripPrint } from './components/PhotoStripPrint'
import { slides } from './lib/slides'
import './styles.css'

type Stage = 'intro' | 'darkroom' | 'printing' | 'complete'

function App() {
  const [stage, setStage] = useState<Stage>('intro')
  const [slideIndex, setSlideIndex] = useState(0)
  const [flash, setFlash] = useState(false)

  const currentSlide = useMemo(() => slides[slideIndex], [slideIndex])

  const triggerFlash = (duration = 420) => {
    setFlash(true)
    window.setTimeout(() => setFlash(false), duration)
  }

  const startDevelop = () => {
    triggerFlash(520)
    window.setTimeout(() => setStage('darkroom'), 360)
  }

  const handleSlideComplete = () => {
    triggerFlash(260)
    if (slideIndex < slides.length - 1) {
      window.setTimeout(() => setSlideIndex((prev) => prev + 1), 220)
      return
    }
    window.setTimeout(() => setStage('printing'), 220)
  }

  const handlePrintDone = () => {
    setStage('complete')
  }

  const handleRestart = () => {
    setSlideIndex(0)
    setStage('intro')
  }

  const isCursorVisible = stage === 'intro' || stage === 'printing' || stage === 'complete'

  return (
    <main className={`app-shell ${isCursorVisible ? 'cursor-visible' : 'cursor-hidden'}`}>
      <div className={`camera-flash ${flash ? 'is-active' : ''}`} aria-hidden />
      <div className="analog-layer grain" aria-hidden />
      <div className="analog-layer dust" aria-hidden />
      <div className="analog-layer leaks" aria-hidden />

      {stage === 'intro' && (
        <section className="intro-screen">
          <p className="intro-copy">Cảm ơn bé My</p>
          <button className="develop-btn" type="button" onClick={startDevelop}>
            nhấn vào đây
          </button>
        </section>
      )}

      {stage === 'darkroom' && currentSlide && (
        <DarkroomCanvas
          key={currentSlide.id}
          slide={currentSlide}
          slideNumber={slideIndex + 1}
          totalSlides={slides.length}
          onComplete={handleSlideComplete}
        />
      )}

      {(stage === 'printing' || stage === 'complete') && (
        <PhotoStripPrint
          slides={slides}
          onDone={handlePrintDone}
          complete={stage === 'complete'}
          onRestart={handleRestart}
        />
      )}
    </main>
  )
}

export default App
