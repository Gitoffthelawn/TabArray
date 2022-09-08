// -*- indent-tabs-mode: nil; tab-width: 2; -*-
// vim: set ts=2 sw=2 et ai :

/*
  Container Tab Groups
  Copyright (C) 2022 Menhera.org

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

// NOTE: Panorama page is not available for private windows. (To be fixed.)
// Panorama pages should be separate for normal and private windows.

import browser from 'webextension-polyfill';
import * as containers from '../modules/containers.js';
import { PanoramaStateStore } from "./PanoramaStateStore";
import { PanoramaTabElement } from "../components/panorama-tab";
import { Tab } from "../frameworks/tabs";
import { IndexTab } from "../modules/IndexTab";
import { UserContextService } from "../userContexts/UserContextService";
import { PanoramaContainerElement } from "../components/panorama-container";
import { UserContext } from "../frameworks/tabGroups";
import * as i18n from '../modules/i18n';

const panoramaStateStore = new PanoramaStateStore();
const userContextService = UserContextService.getInstance();

document.title = i18n.getMessage('panoramaGrid');
document.documentElement.lang = i18n.getEffectiveLocale();

const renderTab = (tab: Tab) => {
  const tabElement = new PanoramaTabElement();
  if (tab.url) {
    tabElement.title = tab.url;
  }
  if (tab.title) {
    tabElement.tabTitle = tab.title;
  } else if (tab.url) {
    tabElement.tabTitle = tab.url;
  }
  if (tab.favIconUrl) {
    tabElement.iconUrl = tab.favIconUrl;
  }
  const previewUrl = panoramaStateStore.getPreviewUrl(tab.id);
  if (previewUrl) {
    tabElement.previewUrl = previewUrl;
  }
  tabElement.addEventListener('button-tab-click', async () => {
    await tab.focus();
    window.close();
  });
  tabElement.addEventListener('button-tab-close', async () => {
    await browser.tabs.remove(tab.id);
    await render();
  });
  return tabElement;
};

const isIndexTab = (url: string): boolean => {
  try {
    new IndexTab(url);
    return true;
  } catch (e) {
    return false;
  }
};

const renderContainer = async (userContext: UserContext) => {
  const userContextId = userContext.id;
  const containerElement = new PanoramaContainerElement(userContext);
  const tabGroup = await userContext.getTabGroup();
  const tabs = (await tabGroup.getTabs()).filter((tab) => !isIndexTab(tab.url));
  containerElement.tabCount = tabs.length;
  containerElement.containerTabsElement.append(...tabs.map((tab) => {
    const tabElement = renderTab(tab);
    return tabElement;
  }));
  containerElement.onNewTabButtonClick.addListener(() => {
    containers.openNewTabInContainer(userContextId, browser.windows.WINDOW_ID_CURRENT).then(() => {
      window.close();
    }).catch((e) => {
      console.error(e);
    });
  });
  return containerElement;
};

const render = async () => {
  console.log('render()');
  const userContexts = (await UserContext.getAll())
    .map((userContext) => userContextService.fillDefaultValues(userContext));
  const containerElements = await Promise.all(userContexts.map((userContext) => renderContainer(userContext)));
  const nonemptyContainerElements = containerElements.filter((containerElement) => containerElement.tabCount > 0);
  const emptyContainerElements = containerElements.filter((containerElement) => containerElement.tabCount === 0);
  const containersContainer = document.querySelector<HTMLDivElement>('#containers');
  if (!containersContainer) {
    throw new Error('containersContainer is null');
  }
  containersContainer.textContent = '';
  containersContainer.append(... nonemptyContainerElements, ... emptyContainerElements);
  console.log('render(): finished');
};

render().catch((e) => {
  console.error(e);
});

browser.tabs.onRemoved.addListener(() => render());
browser.tabs.onUpdated.addListener(() => render(), { properties: ['favIconUrl', 'title', 'url'] });
browser.tabs.onCreated.addListener(() => render());
browser.tabs.query({}).then((browserTabs) => {
  const tabs = browserTabs.map((browserTab) => new Tab(browserTab));
  panoramaStateStore.updatePreviewUrls(tabs.map((tab) => tab.id)).then(() => {
    render().catch((e) => {
      console.error(e);
    });
  });
});