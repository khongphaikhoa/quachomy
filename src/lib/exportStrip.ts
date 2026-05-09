import html2canvas from 'html2canvas'

export async function exportPhotoStrip(stripElement: HTMLElement) {
  const canvas = await html2canvas(stripElement, {
    backgroundColor: null,
    scale: Math.max(window.devicePixelRatio, 2),
    useCORS: true,
    logging: false,
  })
  const link = document.createElement('a')
  link.href = canvas.toDataURL('image/png')
  link.download = 'valentine-photostrip.png'
  link.click()
}
