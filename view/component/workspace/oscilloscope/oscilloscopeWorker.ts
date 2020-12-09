const workerCode = (): void => {
  let canvas: OffscreenCanvas;
  let context: OffscreenCanvasRenderingContext2D;
  let audioData: Float32Array = new Float32Array();
  let leftBound: number;
  let rightBound: number;

  const drawLine = (
    coordinates: number[],
    binSize: number
  ): Promise<boolean> => {
    const x = coordinates[0];
    const y = coordinates[1];

    // const gradient = context.createLinearGradient(0, 0, 170, 0);
    // gradient.addColorStop(0, "rgba(138, 18, 233, 1)");
    // gradient.addColorStop(0.5, "rgba(74, 18, 233, 1)");
    // gradient.addColorStop(1.0, "#56B0F2");
    context.globalAlpha = 0.3;
    context.strokeStyle = "#000000";

    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, y);
    context.lineTo(x + binSize, 0);
    context.stroke();
    context.closePath();
    return Promise.resolve(true);
  };

  // Draws on the canvas in parallel
  const draw = (): void => {
    const length = audioData.length;
    const width = canvas.width;
    const samples =
      Math.floor(width * Math.log(width)) * Number(width > 100) +
      200 * Number(width <= 100);
    const binSize = canvas.width / length;

    // If the value is > size of the array, stepSize < 1 which isn't possible here
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
          drawLine(coordinate, binSize);
      })
    );
  };

  // Gets the message from oscilloscope
  onmessage = function(evt): void {
    if (evt.data) {
      if (!canvas) {
        canvas = evt.data.canvas;
        context = canvas.getContext("2d");
      }

      // If I'm sending audio data, it's changed
      if (evt.data.audioData) {
        audioData = evt.data.audioData;
      }

      // On zoom, scale the canvas
      leftBound = evt.data.leftBound;
      rightBound = evt.data.rightBound;
      canvas.width = evt.data.width;
      context.translate(0, canvas.height / 2);
      draw();
      postMessage(true);
    }
  };
};

// Stack overflow solution for using web workers + react, thank you!
let code = workerCode.toString();
code = code.substring(code.indexOf("{") + 1, code.lastIndexOf("}"));
const blob = new Blob([code], { type: "application/javascript" });
export const workerScript = URL.createObjectURL(blob);
