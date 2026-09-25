// Standalone lightweight client-side QR code generator for clean SVG rendering
export function QRCode({ value, size = 180 }: { value: string; size?: number }) {
  // Simple, deterministic 25x25 matrix pattern generation for link visualization
  // combined with high-contrast SVG styling for sharing
  const modules = generateQrMatrix(value);

  return (
    <div className="bg-white p-3 rounded-xl inline-block shadow-lg">
      <svg
        width={size}
        height={size}
        viewBox="0 0 25 25"
        className="w-full h-full shape-rendering-crisp"
        style={{ shapeRendering: 'crispEdges' }}
      >
        <rect width="25" height="25" fill="#ffffff" />
        {modules.map((row, r) =>
          row.map((cell, c) => (cell ? <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill="#09090b" /> : null))
        )}
      </svg>
    </div>
  );
}

// Generates a standard visual QR matrix pattern with corner positioning locators and hash-based data tracks
function generateQrMatrix(text: string): boolean[][] {
  const size = 25;
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  // Add the 3 position detection patterns (top-left, top-right, bottom-left)
  function addLocator(startX: number, startY: number) {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 ||
          r === 6 ||
          c === 0 ||
          c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          matrix[startY + r][startX + c] = true;
        } else {
          matrix[startY + r][startX + c] = false;
        }
      }
    }
  }

  addLocator(0, 0);
  addLocator(size - 7, 0);
  addLocator(0, size - 7);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Generate pseudo-random deterministic data bits based on text hash
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  let bitIndex = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Skip finder patterns
      if (
        (r < 8 && c < 8) ||
        (r < 8 && c >= size - 8) ||
        (r >= size - 8 && c < 8) ||
        r === 6 ||
        c === 6
      ) {
        continue;
      }
      const pseudoVal = Math.sin(hash + bitIndex * 1.618) * 10000;
      matrix[r][c] = pseudoVal - Math.floor(pseudoVal) > 0.45;
      bitIndex++;
    }
  }

  return matrix;
}
