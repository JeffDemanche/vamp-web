// @ts-nocheck

const useCabLoops = jest.createMockFromModule("../use-cab-loops");

useCabLoops.useCabLoops = jest.fn((): boolean => true);

module.exports = useCabLoops;
