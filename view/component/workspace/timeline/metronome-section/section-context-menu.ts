import { ContextMenuScreen } from "../../../element/menu/context-menu";
import { SectionContextMenuMainScreen } from "./section-context-menu-main-screen";

export enum SectionScreens {
  MainOptionsList
}

export const sectionContextMenuScreens = ({
  sectionName
}: {
  sectionName?: string;
}): ContextMenuScreen[] => [
  {
    id: SectionScreens.MainOptionsList,
    title: sectionName ?? "Section",
    Component: SectionContextMenuMainScreen
  }
];
