import { configure } from "enzyme";
import ReactSixteenAdapter = require("enzyme-adapter-react-16");

configure({ adapter: new ReactSixteenAdapter() });

jest.mock("./view/audio/vamp-audio-context.ts");
jest.mock("./view/audio/vamp-audio-stream.ts");
jest.mock("./view/component/workspace/oscilloscope/oscilloscopeWorker.ts");
