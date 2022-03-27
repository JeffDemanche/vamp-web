import { ContextMenuScreen } from "../../../element/menu/context-menu";
import { BarContextMenuInsertSectionScreen } from "./bar-context-menu-insert-section-screen";
import { BarContextMenuMainScreen } from "./bar-context-menu-main-screen";

export enum BarScreens {
  MainOptionsList,
  BarInsertSection
}

export const barContextMenuScreens = ({
  barNum
}: {
  barNum: number;
}): ContextMenuScreen<object>[] => [
  {
    id: BarScreens.MainOptionsList,
    title: `Bar ${barNum}`,
    Component: BarContextMenuMainScreen
  },
  {
    id: BarScreens.BarInsertSection,
    title: `Insert at ${barNum}`,
    Component: BarContextMenuInsertSectionScreen
  }
];
