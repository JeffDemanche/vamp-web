const mock = jest.fn().mockImplementation(() => {
  return {
    mediaRecorderInitialized: jest.fn(() => true),
    startRecording: jest.fn(() => {}),
    stopRecording: jest.fn(async () => new Promise(() => null))
  };
});

export default mock;
