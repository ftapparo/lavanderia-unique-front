export const generateUnitPositions = (
  start: number,
  end: number,
  unitsPerFloor: number,
): Array<{ floor: number; unitNumber: number }> => {
  const positions: Array<{ floor: number; unitNumber: number }> = [];
  const step = Math.max(unitsPerFloor, 1);
  for (let floor = start; floor <= end; floor += 1) {
    for (let i = 1; i <= step; i += 1) {
      positions.push({ floor, unitNumber: i });
    }
  }
  return positions;
};

export const todayIso = (): string => new Date().toISOString().split("T")[0];
