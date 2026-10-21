export interface Genre {
  name: string
  bpmMin: number
  bpmMax: number
  energy: number // 0-100
  decade: number
}

export const BPM_MIN = 60
export const BPM_MAX = 220

export const genres: Genre[] = [
  { name: 'Blues', bpmMin: 60, bpmMax: 90, energy: 40, decade: 1900 },
  { name: 'Jazz', bpmMin: 80, bpmMax: 140, energy: 50, decade: 1920 },
  { name: 'Samba', bpmMin: 90, bpmMax: 120, energy: 70, decade: 1930 },
  { name: 'Bossa Nova', bpmMin: 60, bpmMax: 120, energy: 35, decade: 1950 },
  { name: 'Rock', bpmMin: 110, bpmMax: 140, energy: 75, decade: 1950 },
  { name: 'Bollywood', bpmMin: 90, bpmMax: 150, energy: 70, decade: 1950 },
  { name: 'Funk', bpmMin: 95, bpmMax: 115, energy: 65, decade: 1960 },
  { name: 'Reggae', bpmMin: 60, bpmMax: 90, energy: 45, decade: 1960 },
  { name: 'Salsa', bpmMin: 160, bpmMax: 220, energy: 80, decade: 1960 },
  { name: 'Disco', bpmMin: 110, bpmMax: 120, energy: 70, decade: 1970 },
  { name: 'Hip-Hop', bpmMin: 80, bpmMax: 100, energy: 60, decade: 1970 },
  { name: 'Metal', bpmMin: 120, bpmMax: 160, energy: 90, decade: 1970 },
  { name: 'Punk', bpmMin: 140, bpmMax: 190, energy: 85, decade: 1970 },
  { name: 'House', bpmMin: 118, bpmMax: 128, energy: 70, decade: 1980 },
  { name: 'Techno', bpmMin: 125, bpmMax: 140, energy: 80, decade: 1980 },
  { name: 'Downtempo', bpmMin: 70, bpmMax: 110, energy: 40, decade: 1990 },
  { name: 'Trip-Hop', bpmMin: 70, bpmMax: 100, energy: 45, decade: 1990 },
  { name: 'Trance', bpmMin: 130, bpmMax: 145, energy: 85, decade: 1990 },
  { name: 'Drum & Bass', bpmMin: 160, bpmMax: 180, energy: 95, decade: 1990 },
  { name: 'K-Pop', bpmMin: 100, bpmMax: 130, energy: 75, decade: 1990 },
  { name: 'Dubstep', bpmMin: 138, bpmMax: 142, energy: 90, decade: 2000 },
  { name: 'Lo-fi', bpmMin: 70, bpmMax: 90, energy: 30, decade: 2010 },
  { name: 'Trap', bpmMin: 130, bpmMax: 160, energy: 70, decade: 2010 },
  { name: 'Ambient', bpmMin: 60, bpmMax: 90, energy: 25, decade: 1970 },
]
