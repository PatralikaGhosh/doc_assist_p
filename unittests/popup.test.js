/**
 * @jest-environment jsdom
 */

global.alert = jest.fn(); // mock alert
global.console.log = jest.fn(); // suppress logs for clean test output
global.console.error = jest.fn();

describe('popup.js functionality', () => {
  let uploadTriggerBtn, uploadPopup, uploadBtn, fileInput, closePopupBtn;

  beforeEach(() => {
    // Setup HTML structure
    document.body.innerHTML = `
      <button id="uploadTriggerBtn">Upload</button>
      <div id="uploadPopup" class="hidden"></div>
      <input type="file" id="fileInput" multiple />
      <button id="uploadBtn">Submit</button>
      <button id="closePopupBtn">Close</button>
    `;

    uploadTriggerBtn = document.getElementById('uploadTriggerBtn');
    uploadPopup = document.getElementById('uploadPopup');
    uploadBtn = document.getElementById('uploadBtn');
    fileInput = document.getElementById('fileInput');
    closePopupBtn = document.getElementById('closePopupBtn');

    // Reset mocks
    jest.clearAllMocks();

    // Mock fetch globally
    global.fetch = jest.fn();

    // Load popup.js (adds event listeners)
    jest.resetModules();
    require('./popup');
  });

  test('clicking uploadTriggerBtn toggles uploadPopup visibility', () => {
    expect(uploadPopup.classList.contains('hidden')).toBe(true);

    uploadTriggerBtn.click();
    expect(uploadPopup.classList.contains('hidden')).toBe(false);

    uploadTriggerBtn.click();
    expect(uploadPopup.classList.contains('hidden')).toBe(true);
  });

  test('logs selected files on file input change', () => {
    const fakeFile1 = new File(['foo'], 'foo.txt', { type: 'text/plain' });
    const fakeFile2 = new File(['bar'], 'bar.txt', { type: 'text/plain' });

    Object.defineProperty(fileInput, 'files', {
      value: [fakeFile1, fakeFile2],
      writable: false,
    });

    fileInput.dispatchEvent(new Event('change'));

    expect(console.log).toHaveBeenCalledWith('Selected files:', 'foo.txt, bar.txt');
  });
});
