// Keep orbital terrain, cloud altitude and island overview in one coordinate system.
export function planetScale(aspect: number) {
  return 8 * Math.max(1, 1.05 / aspect)
}
