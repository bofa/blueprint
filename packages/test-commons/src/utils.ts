/*
 * Copyright 2015 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { expect } from "chai";
import * as React from "react";

/**
 * Dispatch a native KeyBoardEvent on the target element with the given type
 * and event arguments. `type` can be one of "keydown|keyup|keypress".
 *
 * This method is for unit testing with PhantomJS and Chrome ONLY! The hacks we
 * use aren't compatible with other browsers. Do not use this method for
 * anything other than simulating keyboard events for PhantomJS and karma
 * chrome tests.
 */
export function dispatchTestKeyboardEvent(target: EventTarget, eventType: string, key: string, shift = false) {
    dispatchTestKeyboardEventWithCode(target, eventType, key, key.charCodeAt(0), shift);
}

/**
 * Same as dispatchTestKeyboardEvent, but with more control over the keyCode.
 */
export function dispatchTestKeyboardEventWithCode(
    target: EventTarget,
    eventType: string,
    key: string,
    keyCode: number,
    shift = false,
) {
    const event = new KeyboardEvent(eventType, {
        altKey: false,
        bubbles: true,
        cancelable: true,
        ctrlKey: false,
        key,
        location: 0,
        shiftKey: shift,
        view: window,
    });
    // Hack around these readonly properties in WebKit and Chrome
    if (detectBrowser() === Browser.WEBKIT) {
        (event as any).key = key;
        (event as any).which = keyCode;
    } else {
        Object.defineProperty(event, "key", { get: () => key });
        Object.defineProperty(event, "which", { get: () => keyCode });
    }

    target.dispatchEvent(event);
}

/** Enum of known browsers */
enum Browser {
    CHROME,
    EDGE,
    FIREFOX,
    IE,
    UNKNOWN,
    WEBKIT,
}

/**
 * Use feature detection to determine current browser.
 * http://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
 */
function detectBrowser() {
    // Firefox 1.0+
    if (navigator.userAgent.toLowerCase().indexOf("firefox") > -1) {
        return Browser.FIREFOX;
    }

    // Safari <= 9 "[object HTMLElementConstructor]"
    if (Object.prototype.toString.call((window as any).HTMLElement).indexOf("Constructor") > 0) {
        return Browser.WEBKIT;
    }

    // Internet Explorer 6-11
    if (/* @cc_on!@*/ false || !!(document as any).documentMode) {
        return Browser.IE;
    }

    // Edge 20+
    if (!!(window as any).StyleMedia) {
        return Browser.EDGE;
    }

    // Chrome 1+
    if (!!(window as any).chrome && !!(window as any).chrome.webstore) {
        return Browser.CHROME;
    }

    return Browser.UNKNOWN;
}

// see http://stackoverflow.com/questions/16802795/click-not-working-in-mocha-phantomjs-on-certain-elements
// tl;dr PhantomJS sucks so we have to manually create click events
export function createMouseEvent(eventType = "click", clientX = 0, clientY = 0) {
    // see https://developer.mozilla.org/en-US/docs/Web/API/UIEvent/detail
    let detailArg = 0;

    switch (eventType) {
        case "click":
        case "dblclick":
            detailArg = 1;
            break;
        case "mouseup":
        case "mousedown":
            detailArg = 2;
            break;
    }

    const event = new MouseEvent(eventType, {
        bubbles: true,
        button: 0,
        cancelable: true,
        clientX,
        clientY,
        detail: detailArg,
        view: window,
    });

    return event;
}

export function dispatchMouseEvent(target: EventTarget, eventType = "click", clientX = 0, clientY = 0) {
    target.dispatchEvent(createMouseEvent(eventType, clientX, clientY));
}

// PhantomJS doesn't support touch events yet https://github.com/ariya/phantomjs/issues/11571
// so we simulate it with mouse events
export function createTouchEvent(eventType = "touchstart", clientX = 0, clientY = 0) {
    const event = createMouseEvent(eventType, clientX, clientY);
    const touches = [{ clientX, clientY }];
    ["touches", "targetTouches", "changedTouches"].forEach(prop => {
        Object.defineProperty(event, prop, { value: touches });
    });
    return event;
}

export function dispatchTouchEvent(target: EventTarget, eventType = "touchstart", clientX = 0, clientY = 0) {
    target.dispatchEvent(createTouchEvent(eventType, clientX, clientY));
}

/**
 * Helper utility to test validateProps behavior.
 * We can't simply call mount() here since React 16 throws before we can even validate the errors thrown
 * in component constructors.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function expectPropValidationError<P extends object>(
    Component: React.ComponentClass<P>,
    props: P & { children?: React.ReactNode },
    errorMessage?: string,
    assertionMessage?: string,
) {
    const { defaultProps = {} } = Component;
    // HACKHACK: weird casts ahead
    // eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/consistent-type-assertions
    expect(() => new Component({ ...(defaultProps as object), ...(props as object) } as P)).to.throw(
        errorMessage,
        assertionMessage,
    );
}
