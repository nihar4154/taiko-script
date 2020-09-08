"use strict";
const { openBrowser, write, closeBrowser, goto, press, text, focus, inputField, toRightOf } = require('taiko');
const assert = require("assert");
const headless = false;

describe('Getting Started with Mocha and Taiko', () => {

    before(async () => {
        await openBrowser({ headless: headless });
    });

    describe('Search Taiko Repository', () => {

        it('Goto getgauge github page', async () => {
            await goto('https://github.com/getgauge');
        });

        it('Search for "Taiko"', async () => {
            await focus(inputField(toRightOf('Pricing')))
            await write('Taiko');
            await press('Enter');
        });

        it('Page contains "getgauge/taiko"', async () => {
            assert.ok(await text('getgauge/taiko').exists());
        });

    });

    after(async () => {
        await closeBrowser();
    });

});
