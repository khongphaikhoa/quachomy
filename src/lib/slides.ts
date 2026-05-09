export type MemorySlide = {
  id: string
  imageSrc: string
  note: string
  doodle: string
  caption: string
}

const darkroomAssetBase = `${import.meta.env.BASE_URL}darkroom-photo/`
const placeholderImage = `${darkroomAssetBase}DSC07920.JPG`

export const slides: MemorySlide[] = [
  {
    id: 'slide-1',
    imageSrc: `${darkroomAssetBase}slide-1.jpg`,
    note: 'Mừng ngày kỉ niệm 18 tháng của mình...',
    doodle: '25/04/26',
    caption: 'Tặng người thương của anh',
  },
  {
    id: 'slide-2',
    imageSrc: `${darkroomAssetBase}slide-2.jpg`,
    note: 'anh mong em sẽ luôn nhớ là...',
    doodle: '29/04/26',
    caption: 'vì em đã cho anh 18 tháng',
  },
  {
    id: 'slide-3',
    imageSrc: placeholderImage,
    note: 'những gì mình có, anh sẽ không bao giờ quên.',
    doodle: '25/04/26',
    caption: 'hạnh phúc nhất trên đời.',
  },
]
