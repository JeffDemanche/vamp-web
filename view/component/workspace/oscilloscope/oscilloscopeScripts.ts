// Helper for drawing a single line
const drawLine = (
  canvas: HTMLCanvasElement | OffscreenCanvas,
  coordinates: number[],
  binSize: number
): Promise<boolean> => {
  const x = coordinates[0];
  const y = coordinates[1];
  const context = canvas.getContext("2d");
  const gradient = context.createLinearGradient(0, 0, 170, 0);
  gradient.addColorStop(0, "rgba(138, 18, 233, 1)");
  gradient.addColorStop(0.5, "rgba(74, 18, 233, 1)");
  gradient.addColorStop(1.0, "#56B0F2");
  context.strokeStyle = gradient;
  context.beginPath();
  context.moveTo(x, 0);
  context.lineTo(x, y);
  context.lineTo(x + binSize, 0);
  context.stroke();
  context.closePath();
  return Promise.resolve(true);
};

// Draws on the canvas in parallel
export const draw = (
  canvas: HTMLCanvasElement | OffscreenCanvas,
  audioData: Float32Array,
  leftBound: number,
  rightBound: number
): void => {
  const length = audioData.length;
  const width = canvas.width;
  const samples =
    Math.floor(width * Math.log(width)) * Number(width > 100) +
    200 * Number(width <= 100); // Adaptive resolution
  const binSize = width / length;
  const stepSize = Math.max(Math.floor(audioData.length / samples), 1);
  const canvasScale = 0.5;
  const coordinatesArray: number[][] = [[]];
  for (let i = 0; i < audioData.length; i = i + stepSize) {
    const coordinate = [
      binSize * i,
      audioData[i] * canvasScale * canvas.height
    ];
    coordinatesArray.push(coordinate);
  }

  // Draw points in parallel
  Promise.all(
    coordinatesArray.map(coordinate => {
      if (coordinate[0] > -leftBound || coordinate[0] < rightBound)
        drawLine(canvas, coordinate, binSize);
    })
  );
};
