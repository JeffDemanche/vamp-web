/**
 * Wrapper class for the user's audio stream, exported as a module so the same
 * instance is accessible to different places in the code, note well that stream is
 * a promise
 */
class VampAudioStream {
  private _stream: Promise<MediaStream>;

  constructor() {
    Promise.all([this.setUpMedia(), this.sendAlert()]);
  }

  private setUpMedia = (): Promise<boolean> => {
    this._stream = window.navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: 48000
      },
      video: false
    });
    return Promise.resolve(true);
  };

  public sendAlert = (): Promise<boolean> => {
    navigator.permissions
      .query({ name: "microphone" })
      .then(permissionStatus => {
        switch (permissionStatus.state) {
          case "granted":
            break;
          case "denied":
            alert(
              // eslint-disable-next-line max-len
              "You accidently blocked us from using your mic! You'll have to manually change your mic permissions in your browser so that we can help you record.  We only record you when you ask us to."
            );
            break;
          default:
            alert(
              // eslint-disable-next-line max-len
              "Vamp needs a microphone to record your audio tracks.  Help us help you by giving us permission to use your microphone.  We only record you when you ask us to."
            );
        }

        // TODO
        permissionStatus.onchange = function(): void {
          console.log("mic permission has changed to ", this.state);
        };
      })
      .catch(() => {
        // If permissions API is not available
        alert(
          // eslint-disable-next-line max-len
          "Vamp needs a microphone to record your audio tracks.  Help us help you by giving us permission to use your microphone.  We only record you when you ask us to."
        );
      });

    return Promise.resolve(true);
  };

  getAudioStream = (): Promise<MediaStream> => this._stream;
}

// eslint-disable-next-line prefer-const
export let vampAudioStream = new VampAudioStream();
