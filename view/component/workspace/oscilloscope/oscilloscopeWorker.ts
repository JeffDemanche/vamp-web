const workerCode = (): void => {
  let canvas: any;
  let context: any;
  // cache current audio data
  let audioData: number[];
  let binSize: number;

  const getResolution = (width: number): number => {
    // Played around with Desmos to get this function, maybe needs tweaking
    const numSamples = width > 100 ? Math.floor(width * Math.log(width)) : 200;
    return numSamples;
  };

  const drawLine = (coordinates: number[]): Promise<boolean> => {
    const x = coordinates[0];
    const y = coordinates[1];

    // TODO: Styling gradient of the waveform

    // context.strokeStyle = `rgb(
    //   ${Math.floor(255 - Math.abs(x))},
    //   ${Math.floor(255 - 42 * Math.abs(x))},
    //   ${Math.floor(255 - Math.abs(y))})`;

    const gradient = context.createLinearGradient(0, 0, 170, 0);
    gradient.addColorStop("0", "rgba(74, 18, 233, 1)");
    gradient.addColorStop("1.0", "#56B0F2");
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
  const draw = (): void => {
    const length = audioData.length;
    const samples = getResolution(canvas.width);
    binSize = canvas.width / length;

    const yVals = audioData.map((data: number) => data * canvas.height);
    const xVals = Array.from(new Array(length), (x, i) => binSize * i);

    const stepSize = Math.max(Math.floor(yVals.length / samples), 1);
    const coordinatesArray = [];
    for (let k = 0; k < yVals.length; k = k + stepSize) {
      const coordinates = [xVals[k], yVals[k]];
      coordinatesArray.push(coordinates);
    }

    // Draw in parallel
    Promise.all(coordinatesArray.map(coordinates => drawLine(coordinates)));
  };

  // Gets the message from oscilloscope
  onmessage = function(evt): void {
    if (evt.data) {
      if (!canvas) {
        canvas = evt.data.canvas;
        canvas.width = evt.data.width;
        canvas.height = evt.data.height;
      }
      if (!context) {
        context = canvas.getContext("2d", { alpha: true });
      }
      // If I'm sending audio data, it's changed, otherwise use cached
      if (evt.data.audioData) {
        audioData = evt.data.audioData;
      }
      // On zoom

      context.scale(evt.data.width / canvas.width, 1);
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
