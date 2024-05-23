export function extentForCoordinates(coordinates) {
  let minX = Infinity,
    minY = Infinity
  let maxX = -Infinity,
    maxY = -Infinity

  for (const coordinate of coordinates) {
    if (coordinate[0] < minX) {
      minX = coordinate[0]
    }
    if (coordinate[0] > maxX) {
      maxX = coordinate[0]
    }
    if (coordinate[1] < minY) {
      minY = coordinate[1]
    }
    if (coordinate[1] > maxY) {
      maxY = coordinate[1]
    }
  }

  return [minX, minY, maxX, maxY]
}
