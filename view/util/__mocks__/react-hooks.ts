// @ts-nocheck

const reactHooks = jest.createMockFromModule("../react-hooks");

reactHooks.useCurrentVampId = jest.fn(() => "6070dedd58d7bf715eb2a6c5");
reactHooks.useCurrentUserId = jest.fn(() => "60845d7a1555fa2f4a781832");
reactHooks.usePrevious = jest.requireActual("../react-hooks").usePrevious;

module.exports = reactHooks;
