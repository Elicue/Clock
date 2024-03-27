export const deg2rad = (deg) => {
  return (deg * Math.PI) / 180;
};

export const distance2D = (x1, y1, x2, y2) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
};
