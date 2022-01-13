/*
 *  Copyright 2022, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */

 export function getOrigin() {
   let { protocol, hostname, port } = window.location;
   port = port ? `:${port}` : '';
   return `${protocol}//${hostname}${port}`;
 }
