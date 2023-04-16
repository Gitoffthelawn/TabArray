/* -*- indent-tabs-mode: nil; tab-width: 2; -*- */
/* vim: set ts=2 sw=2 et ai : */
/**
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
  @license
**/

import browser from 'webextension-polyfill';
import { CompatTab } from "weeg-tabs";

import { ContainerVisibilityService } from '../../legacy-lib/userContexts/ContainerVisibilityService';

const containerVisibilityService = ContainerVisibilityService.getInstance();

browser.tabs.onActivated.addListener(async ({tabId, windowId}) => {
  try {
    const browserTab = await browser.tabs.get(tabId);
    if (browserTab.cookieStoreId == null || browserTab.id == null) return;
    const tab = new CompatTab(browserTab);
    const cookieStore = tab.cookieStore;
    if (cookieStore.isPrivate) {
      return;
    }
    try {
      const indexTabUrl = await browser.sessions.getTabValue(browserTab.id, 'indexTabUrl');
      if (!indexTabUrl) {
        throw void 0;
      }
      const nextTabs = await browser.tabs.query({
        windowId: browserTab.windowId,
        index: browserTab.index + 1,
      });
      for (const nextTab of nextTabs) {
        await browser.tabs.update(nextTab.id, {
          active: true,
        });
        break;
      }
    } catch (e) {
      // nothing.
    }

    if (!browserTab.pinned) {
      await containerVisibilityService.showContainerOnWindow(windowId, cookieStore.id);
    }
  } catch (e) {
    console.error(e);
  }
});
