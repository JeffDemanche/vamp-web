// @ts-nocheck

const clientClipStateHooks = jest.createMockFromModule(
  "../client-clip-state-hooks"
);

clientClipStateHooks.useBeginClientClip = jest.fn((): ((
  start: number,
  audioStoreKey: string,
  latencyCompensation: number
) => void) => {
  return (): void => {};
});

clientClipStateHooks.useEndClientClip = jest.fn((): ((
  audioStoreKey: string
) => void) => {
  return (): void => {};
});

module.exports = clientClipStateHooks;
