// Loaded with `defer`, so the DOM is already parsed — flips the Google Fonts
// stylesheet from non-blocking (media="print") to active as soon as possible
// without making it a render-blocking resource.
var gfontsLink = document.getElementById('gfonts-link');
if (gfontsLink) gfontsLink.media = 'all';
