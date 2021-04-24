// @ts-nocheck

const vampStateHooks = jest.createMockFromModule("../vamp-state-hooks");

vampStateHooks.useCountOff = jest.fn(() => (): void => {});
vampStateHooks.usePlay = jest.fn(() => (): void => {});
vampStateHooks.usePause = jest.fn(() => (): void => {});
vampStateHooks.useStop = jest.fn(() => (): void => {});
vampStateHooks.useSeek = jest.fn(() => (): void => {});
vampStateHooks.useRecord = jest.fn(() => (): void => {});
vampStateHooks.useSetLoop = jest.fn(() => (): void => {});
vampStateHooks.useSetFloorOpen = jest.fn(() => (): void => {});

module.exports = vampStateHooks;
