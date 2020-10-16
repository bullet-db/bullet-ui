/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import CodeMirror from 'codemirror';
import 'codemirror/mode/sql/sql';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/sql-hint';
import isEmpty from 'bullet-ui/utils/is-empty';
import QueryConverter from 'bullet-ui/utils/query-converter';

const MIME = 'text/x-bql';

function set(str) {
  let object = { };
  str.split(' ').forEach(word => {
    object[word] = true;
  });
  return object;
}

export function defineBQL() {
  CodeMirror.defineMIME(MIME, {
    name: 'sql',
    keywords: set('select as cast count distinct sum mix max avg from where and or not is all any true false null ' +
                  'group by having order asc desc limit'),
    builtin: set('string boolean integer long float double map list stream windowing tumbling quantile freq cumfreq ' +
                 'top sizeis rlike containskey containsvalue'),
    atoms: set('false true null first every time record linear region manual'),
    operatorChars: /^[*+\-/%<>!=&|^]/,
    dateSQL: { },
    support: set('zerolessFloat doubleQuote commentHash commentSlashSlash')
  });
}

export function addEditor(element, columns, initialContent) {
  defineBQL();
  let options = getConfiguration(columns);
  if (!isEmpty(initialContent)) {
    options.value = QueryConverter.formatQuery(initialContent);
  }
  options.mode = MIME;
  return CodeMirror(element, options);
}

export function getEditorContent(editor) {
  return editor.getValue();
}

function getConfiguration(columns) {
  return {
    lineNumbers: true,
    lineWrapping: true,
    extraKeys: {
      "Ctrl-Space": "autocomplete"
    },
    hintOptions: {
      defaultTable: 'default',
      tables: {
        default: columns
      }
    },
    autoCloseBrackets: true,
    matchBrackets: true
  };
}
