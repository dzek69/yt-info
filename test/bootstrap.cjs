const must = require("must/register");
const fetch = require("node-fetch");
// @ts-ignore
global.must = must;

// for some unknown reason jsdom is loaded (Jest?) and breaks stuff by adding `window` global, can't fix it right now
// so let's fake it even more.
window.fetch = fetch;
