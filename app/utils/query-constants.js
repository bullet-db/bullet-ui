/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { Enum } from 'bullet-ui/utils/type';

export const AGGREGATION_TYPES = Enum.of(['RAW', 'GROUP', 'COUNT_DISTINCT', 'DISTRIBUTION', 'TOP_K']);
export const RAW_TYPES = Enum.of(['ALL', 'SELECT']);
export const DISTRIBUTION_TYPES = Enum.of(['QUANTILE', 'PMF', 'CDF']);
export const DISTRIBUTION_POINT_TYPES = Enum.of(['NUMBER', 'POINTS', 'GENERATED']);
