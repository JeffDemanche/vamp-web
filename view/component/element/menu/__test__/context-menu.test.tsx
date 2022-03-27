import { mount } from "enzyme";
import * as React from "react";
import { useCallback, useRef } from "react";
import { act } from "react-dom/test-utils";
import { useContextMenu } from "../context-menu";
import { ContextMenuProvider } from "../context-menu-context";

const MockMainScreen = () => {
  return <div>Mock main screen</div>;
};

const ContextMenuHookComponent = ({
  onContextMenuOpened,
  onContextMenuClosed,
  openRef,
  closeRef
}: {
  onContextMenuOpened?: () => void;
  onContextMenuClosed?: () => void;
  openRef?: React.MutableRefObject<(pos: { x: number; y: number }) => void>;
  closeRef?: React.MutableRefObject<() => void>;
}) => {
  const targetRef = useRef<HTMLDivElement>(null);

  const { openMenu, closeMenu } = useContextMenu({
    target: targetRef,
    screens: [{ id: 0, title: "Test", Component: MockMainScreen }],
    initialScreen: 0,
    onContextMenuOpened,
    onContextMenuClosed
  });

  openRef.current = useCallback(
    (pos: { x: number; y: number }) => openMenu(pos),
    [openMenu]
  );
  closeRef.current = useCallback(() => closeMenu(), [closeMenu]);

  return (
    <div
      data-test-id="menu_trigger_1"
      style={{ width: "100px", height: "100px" }}
      ref={targetRef}
    >
      click here
    </div>
  );
};

describe("ContextMenu", () => {
  it("opening a context menu renders the menu on an overlay until it gets closed", () => {
    const onOpenMock = jest.fn();
    const onCloseMock = jest.fn();

    const openRef = React.createRef<(pos: { x: number; y: number }) => void>();
    const closeRef = React.createRef<() => void>();

    let component = mount(
      <ContextMenuProvider>
        <div style={{ position: "absolute", width: "200px", height: "300px" }}>
          <ContextMenuHookComponent
            onContextMenuOpened={onOpenMock}
            onContextMenuClosed={onCloseMock}
            openRef={openRef}
            closeRef={closeRef}
          ></ContextMenuHookComponent>
        </div>
      </ContextMenuProvider>
    );

    expect(component.find("[data-test-id='context-menu-div']").exists()).toBe(
      false
    );

    act(() => {
      openRef.current({ x: 123, y: 456 });
    });
    component = component.update();

    const menu = component.find("[data-test-id='context-menu-div']");
    expect(menu.exists()).toBe(true);
    expect(menu.prop("style").left).toEqual("123px");
    expect(menu.prop("style").top).toEqual("456px");

    act(() => {
      closeRef.current();
    });
    component = component.update();

    expect(component.find("[data-test-id='context-menu-div']").exists()).toBe(
      false
    );
  });

  it("context menu hook correctly calls open and close callbacks using openMenu and closeMenu return functions", () => {
    const onOpenMock = jest.fn();
    const onCloseMock = jest.fn();

    const openRef = React.createRef<(pos: { x: number; y: number }) => void>();
    const closeRef = React.createRef<() => void>();

    mount(
      <ContextMenuProvider>
        <div style={{ position: "absolute", width: "200px", height: "300px" }}>
          <ContextMenuHookComponent
            onContextMenuOpened={onOpenMock}
            onContextMenuClosed={onCloseMock}
            openRef={openRef}
            closeRef={closeRef}
          ></ContextMenuHookComponent>
        </div>
      </ContextMenuProvider>
    );

    expect(onOpenMock).not.toHaveBeenCalled();
    expect(onCloseMock).not.toHaveBeenCalled();

    act(() => {
      openRef.current({ x: 0, y: 0 });
    });

    expect(onOpenMock).toHaveBeenCalledTimes(1);
    expect(onCloseMock).not.toHaveBeenCalled();

    act(() => {
      closeRef.current();
    });

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("calls close listener on context menu 1 if context menu 2 is opened and replaces context menu 1", () => {
    const onOpenMock1 = jest.fn();
    const onCloseMock1 = jest.fn();
    const openRef1 = React.createRef<(pos: { x: number; y: number }) => void>();
    const closeRef1 = React.createRef<() => void>();

    const onOpenMock2 = jest.fn();
    const onCloseMock2 = jest.fn();
    const openRef2 = React.createRef<(pos: { x: number; y: number }) => void>();
    const closeRef2 = React.createRef<() => void>();

    mount(
      <ContextMenuProvider>
        <div style={{ position: "absolute", width: "200px", height: "300px" }}>
          <ContextMenuHookComponent
            onContextMenuOpened={onOpenMock1}
            onContextMenuClosed={onCloseMock1}
            openRef={openRef1}
            closeRef={closeRef1}
          ></ContextMenuHookComponent>
          <ContextMenuHookComponent
            onContextMenuOpened={onOpenMock2}
            onContextMenuClosed={onCloseMock2}
            openRef={openRef2}
            closeRef={closeRef2}
          ></ContextMenuHookComponent>
        </div>
      </ContextMenuProvider>
    );

    expect(onOpenMock1).not.toHaveBeenCalled();
    expect(onCloseMock1).not.toHaveBeenCalled();
    expect(onOpenMock2).not.toHaveBeenCalled();
    expect(onCloseMock2).not.toHaveBeenCalled();

    act(() => {
      openRef1.current({ x: 0, y: 0 });
    });
    act(() => {
      openRef2.current({ x: 0, y: 0 });
    });

    expect(onOpenMock1).toHaveBeenCalledTimes(1);
    expect(onCloseMock1).toHaveBeenCalledTimes(1);
    expect(onOpenMock2).toHaveBeenCalledTimes(1);
    expect(onCloseMock2).not.toHaveBeenCalled();
  });
});
