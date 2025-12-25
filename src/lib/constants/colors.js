const CATEGORY_COLORS = [
  '#FF0000',  // Red
  '#FF8700',  // Orange
  '#FFD300',  // Gold
  '#DEFF0A',  // Lime Yellow
  '#A1FF0A',  // Slime Lime
  '#0AFF99',  // Spring Green
  '#0AEFFF',  // Electric Aqua
  '#147DF5',  // Azure Blue
  '#580AFF',  // Electric Indigo
  '#BE0AFF',  // Hyper Magenta
  '#FF1493',  // Deep Pink
  '#FF4500',  // Orange Red
  '#32CD32',  // Lime Green
  '#00CED1',  // Dark Turquoise
  '#4169E1',  // Royal Blue
  '#9932CC',  // Dark Orchid
  '#DC143C',  // Crimson
  '#20B2AA',  // Light Sea Green
];

// Optimized order for maximum visual distinction between consecutive assignments
// First few picks spread across the color wheel, then fill in gaps
const COLOR_ASSIGNMENT_ORDER = [
  0,   // Red - warm primary
  8,   // Electric Indigo - cool, opposite spectrum
  5,   // Spring Green - bright green
  10,  // Deep Pink - warm pink
  13,  // Dark Turquoise - cool teal
  2,   // Gold - warm yellow
  15,  // Dark Orchid - cool purple
  12,  // Lime Green - bright green variant
  1,   // Orange - warm
  14,  // Royal Blue - cool blue
  9,   // Hyper Magenta - cool pink-purple
  6,   // Electric Aqua - cool cyan
  16,  // Crimson - dark warm red
  4,   // Slime Lime - bright yellow-green
  7,   // Azure Blue - medium blue
  17,  // Light Sea Green - teal variant
  3,   // Lime Yellow - bright yellow
  11,  // Orange Red - warm red-orange
];

// Get the color for a given category count (0-indexed)
function getCategoryColor(categoryCount) {
  const orderIndex = categoryCount % COLOR_ASSIGNMENT_ORDER.length;
  const colorIndex = COLOR_ASSIGNMENT_ORDER[orderIndex];
  return CATEGORY_COLORS[colorIndex];
}

export { CATEGORY_COLORS, COLOR_ASSIGNMENT_ORDER, getCategoryColor };
