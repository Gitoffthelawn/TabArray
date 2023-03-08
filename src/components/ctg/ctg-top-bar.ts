// -*- indent-tabs-mode: nil; tab-width: 2; -*-
// vim: set ts=2 sw=2 et ai :

/*
  Container Tab Groups
  Copyright (C) 2023 Menhera.org

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { EventSink } from "../../frameworks/utils";
import { CtgMenuItemElement } from "./ctg-menu-item";

export class CtgTopBarElement extends HTMLElement {
  public readonly onDrawerButtonClicked = new EventSink<void>();
  public readonly onBackButtonClicked = new EventSink<void>();

  private readonly _menuItems = new Map<string, CtgMenuItemElement>();
  private readonly _overflowMenuItems = new Map<string, CtgMenuItemElement>();

  public constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    if (!this.shadowRoot) {
      throw new Error('Shadow root is null');
    }

    const styleSheet = document.createElement('link');
    styleSheet.rel = 'stylesheet';
    styleSheet.href = '/components/ctg/ctg-top-bar.css';
    this.shadowRoot.appendChild(styleSheet);

    const drawerButton = document.createElement('button');
    drawerButton.id = 'drawer-button';
    this.shadowRoot.appendChild(drawerButton);
    drawerButton.addEventListener('click', () => {
      this.onDrawerButtonClicked.dispatch();
    });

    const backButton = document.createElement('button');
    backButton.id = 'back-button';
    this.shadowRoot.appendChild(backButton);
    backButton.addEventListener('click', () => {
      this.onBackButtonClicked.dispatch();
    });
    backButton.hidden = true;

    const heading = document.createElement('h1');
    heading.id = 'heading';
    this.shadowRoot.appendChild(heading);

    const overflowMenu = new CtgMenuItemElement();
    overflowMenu.id = 'overflow-menu';
    overflowMenu.iconSrc = '/img/material-icons/more_vert.svg';
    overflowMenu.displayStyle = 'icon';
    this.shadowRoot.appendChild(overflowMenu);
  }

  public get headingText(): string {
    const heading = this.shadowRoot?.getElementById('heading');
    if (!heading) {
      return '';
    }
    return heading.textContent ?? '';
  }

  public set headingText(text: string) {
    const heading = this.shadowRoot?.getElementById('heading');
    if (!heading) {
      return;
    }
    heading.textContent = text;
  }

  public get backButtonEnabled(): boolean {
    const backButton = this.shadowRoot?.getElementById('back-button');
    if (!backButton) {
      return false;
    }
    return !backButton.hidden;
  }

  public set backButtonEnabled(enabled: boolean) {
    const backButton = this.shadowRoot?.getElementById('back-button');
    if (!backButton) {
      return;
    }
    backButton.hidden = !enabled;
  }

  public get drawerButtonEnabled(): boolean {
    const drawerButton = this.shadowRoot?.getElementById('drawer-button');
    if (!drawerButton) {
      return false;
    }
    return !drawerButton.hidden;
  }

  public set drawerButtonEnabled(enabled: boolean) {
    const drawerButton = this.shadowRoot?.getElementById('drawer-button');
    if (!drawerButton) {
      return;
    }
    drawerButton.hidden = !enabled;
  }

  public clearMenuItems() {
    for (const [, menuItem] of this._menuItems) {
      menuItem.remove();
    }
    this._menuItems.clear();
  }

  public clearOverflowMenuItems() {
    for (const [, menuItem] of this._overflowMenuItems) {
      menuItem.remove();
    }
    this._overflowMenuItems.clear();
  }

  public removeMenuItem(id: string) {
    const menuItem = this._menuItems.get(id);
    if (!menuItem) {
      return;
    }
    menuItem.remove();
    this._menuItems.delete(id);
  }

  public removeOverflowMenuItem(id: string) {
    const menuItem = this._overflowMenuItems.get(id);
    if (!menuItem) {
      return;
    }
    menuItem.remove();
    this._overflowMenuItems.delete(id);
  }

  public addMenuItem(id: string, menuItem: CtgMenuItemElement) {
    menuItem.displayStyle = 'icon';
    const overflowMenu = this.shadowRoot?.getElementById('overflow-menu') ?? null;
    this.removeMenuItem(id);
    this._menuItems.set(id, menuItem);
    this.shadowRoot?.insertBefore(menuItem, overflowMenu);
  }

  public addOverflowMenuItem(id: string, menuItem: CtgMenuItemElement) {
    menuItem.displayStyle = 'normal';
    this.removeOverflowMenuItem(id);
    const overflowMenu = this.shadowRoot?.getElementById('overflow-menu') ?? null;
    if (!overflowMenu) {
      return;
    }
    this._overflowMenuItems.set(id, menuItem);
    overflowMenu.appendChild(menuItem);
  }

  public getMenuItem(id: string): CtgMenuItemElement | null {
    return this._menuItems.get(id) ?? null;
  }

  public getOverflowMenuItem(id: string): CtgMenuItemElement | null {
    return this._overflowMenuItems.get(id) ?? null;
  }
}

customElements.define('ctg-top-bar', CtgTopBarElement);
