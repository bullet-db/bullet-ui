/*
 *  Copyright 2018, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
 import { findAll } from '@ember/test-helpers';

/**
 * Find the first element matched by the given selector within the given context element.
 * Equivalent to calling `querySelector()` on the context element.
 * @param {string} selector the selector to search for
 * @param {Element} context the element to search within
 * @return {Element} matched element or null
 */
export function findWithContext(selector, context) {
  return context.querySelector(selector);
}

/**
 * Find all elements matched by the given selector within the given context element.
 * Equivalent to calling `querySelectorAll()` on the context element.
 * @param {string} selector the selector to search for
 * @param {Element} context the element to search within
 * @return {Array} an array of matched elements
 */
export function findAllWithContext(selector, context) {
  return context.querySelectorAll(selector);
}

/**
 * Find all siblings of an element which have a given class.
 * @param  {Element} elem the element to get siblings
 * @param {string} className the class name to match.
 * @return {Array} an array of all matched sibling nodes
 */
export function findSiblings(elem, className) {
  let siblings = [];
  for (let sibling = elem.parentNode.firstChild; sibling; sibling = sibling.nextSibling) {
    if (sibling.nodeType === 1 && sibling !== elem && sibling.classList.contains(className)) {
      siblings.push(sibling);
    }
  }
  return siblings;
}

/**
 * Find the first element which contains the given text.
 * @param {string} selector the selector to search for
 * @param {string} text the text to find
 * @return {Element} matched element or null
 */
export function findContains(selector, text) {
  let elements = findAll(selector);
  for (let i = 0; i < elements.length; i++) {
    if (elements[i].textContent.includes(text)) {
      return elements[i];
    }
  }
  return null;
}
