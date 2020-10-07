/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import CodeMirror from 'codemirror';
import isEmpty from 'bullet-ui/utils/is-empty';

const MIME = 'text/x-bql';

CodeMirror.defineMIME(MIME, {
  name: 'sql',
  keywords: set('select as cast count distinct sum mix max avg from where and or not is all any true false null group by having order asc desc limit'),
  builtin: set('string boolean integer long float double map list stream windowing tumbling quantile freq cumfreq top sizeis rlike containskey containsvalue'),
  atoms: set('false true null first every time record linear region manual'),
  operatorChars: /^[*+\-%<>!=&|^\/]/,
  dateSQL: { },
  support: set('zerolessFloat doubleQuote commentHash commentSlashSlash')
});

function set(str) {
  let object = { };
  str.split(' ').forEach(word => {
    object[word] = true;
  });
  return object;
}

export function addCodeEditor(element, columns, initialContent) {
  if (!isEmpty(initialContent)) {
    options.value = initialContent;
  }
  options.mode = MIME;
}
