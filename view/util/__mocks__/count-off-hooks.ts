// @ts-nocheck

const countOffHooks = jest.createMockFromModule("../count-off-hooks");

countOffHooks.useUpdateCountOff = jest.fn(() => (): void => {});

module.exports = countOffHooks;
