/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Enum from 'bullet-ui/utils/enum';

export class DescribableEnum extends Enum {
  get descriptions() {
    return this.symbols.map(symbol => this.describe(symbol));
  }

  describe(symbol) {
    return this.getMetaEntryForSymbol(symbol, 'description');
  }

  description(name) {
    return this.getMetaEntryForName(name, 'description');
  }

  name(description) {
    return this.names.find(name => this.description(name) === description);
  }

  static of(names) {
    return new DescribableEnum(names);
  }
}

const RAW = { name: 'RAW', description: 'Raw' };
const GROUP = { name: 'GROUP', description: 'Group' };
const COUNT_DISTINCT = { name: 'COUNT_DISTINCT', description: 'Count Distinct' };
const DISTRIBUTION = { name: 'DISTRIBUTION', description: 'Distribution' };
const TOP_K = { name: 'TOP_K', description: 'Top K' };

const ALL_RAW =  { name: 'ALL', description: 'All' };
const SELECT =  { name: 'SELECT', description: 'Select' };

const QUANTILE = { name: 'QUANTILE', description: 'Quantile' };
const FREQ = { name: 'FREQ', description: 'Frequency' };
const CUMFREQ = { name: 'CUMFREQ', description: 'Cumulative Frequency' };

const NUMBER =  { name: 'NUMBER', description: 'Number' };
const POINTS =  { name: 'POINTS', description: 'Points' };
const GENERATED =  { name: 'GENERATED', description: 'Generated' };

const COUNT = { name: 'COUNT', description: 'Count' };
const SUM = { name: 'SUM', description: 'Sum' };
const MIN = { name: 'MIN', description: 'Minimum' };
const MAX = { name: 'MAX', description: 'Maximum' };
const AVG = { name: 'AVG', description: 'Average' };

const TIME = { name: 'TIME', description: 'Time Based' };
const RECORD = { name: 'RECORD', description: 'Record Based' };

const WINDOW = { name: 'WINDOW', description: 'Everything in Window' };
const ALL_INCLUDE = { name: 'ALL', description: 'Everything from Start of Query' };

export const AGGREGATION_TYPES = DescribableEnum.of([RAW, GROUP, COUNT_DISTINCT, DISTRIBUTION, TOP_K]);
export const RAW_TYPES = DescribableEnum.of([ALL_RAW, SELECT]);
export const DISTRIBUTION_TYPES = DescribableEnum.of([QUANTILE, FREQ, CUMFREQ]);
export const DISTRIBUTION_POINT_TYPES = DescribableEnum.of([NUMBER, POINTS, GENERATED]);
export const METRIC_TYPES = DescribableEnum.of([COUNT, SUM, MIN, MAX, AVG]);
export const EMIT_TYPES = DescribableEnum.of([TIME, RECORD]);
export const INCLUDE_TYPES = DescribableEnum.of([WINDOW, ALL_INCLUDE]);
