import { images } from './images'

export const titles = [
  { text: 'Alpha', style: { 'margin-right': '0.03em' } },
  { text: 'Bravo' },
  { text: 'Charlie', style: { 'margin-right': '0.025em' } },
  { text: 'Delta', style: { 'margin-right': '0.03em' } },
  { text: 'Echo' },
  { text: 'Foxtrot', style: { 'margin-right': '0.045em' } },
]

export const projects = titles.map((title, index) => ({
  title,
  slug: title.text.toLowerCase(),
  image: images[index % images.length]!,
}))
