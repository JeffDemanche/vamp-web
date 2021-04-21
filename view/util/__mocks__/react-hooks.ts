// @ts-nocheck

const reactHooks = jest.createMockFromModule("../react-hooks");

reactHooks.useCurrentVampId = jest.fn(() => "6070dedd58d7bf715eb2a6c5");
reactHooks.usePrevious = jest.requireActual("../react-hooks").usePrevious;

module.exports = reactHooks;
