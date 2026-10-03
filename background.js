// Right-click menus: build a QR from a link, selected text, an image, or the page itself.
const ITEMS = [
  { id: "qr-link",  title: "QR code for this link",  contexts: ["link"] },
  { id: "qr-text",  title: "QR code for selected text", contexts: ["selection"] },
  { id: "qr-image", title: "QR code for this image's URL", contexts: ["image"] },
  { id: "qr-page",  title: "QR code for this page",  contexts: ["page"] }
];

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    ITEMS.forEach((i) => chrome.contextMenus.create(i));
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  let payload = "";
  switch (info.menuItemId) {
    case "qr-link":  payload = info.linkUrl; break;
    case "qr-text":  payload = info.selectionText; break;
    case "qr-image": payload = info.srcUrl; break;
    case "qr-page":  payload = info.pageUrl || (tab && tab.url) || ""; break;
  }
  if (!payload) return;
  await chrome.storage.session.set({ pending: payload });
  try {
    await chrome.action.openPopup();
  } catch (e) {
    // Fallback if the popup can't be opened programmatically
    chrome.windows.create({ url: "popup.html", type: "popup", width: 380, height: 560 });
  }
});
