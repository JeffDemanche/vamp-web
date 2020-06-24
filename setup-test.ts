import "jsdom-global/register";
import "jest";
import { configure } from "enzyme";
import * as ReactSixteenAdapter from "enzyme-adapter-react-16";
import "babel-polyfill";

const adapter = ReactSixteenAdapter as any;
configure({
  adapter: new adapter.default()
});
