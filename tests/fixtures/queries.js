import FILTERS from '../fixtures/filters';

const QUERIES = {
  AND_ENUMERATED_COUNT_DISTINCT: {
    filters: [FILTERS.AND_ENUMERATED],
    aggregation: {
      type: 'COUNT DISTINCT',
      fields: {
        simple_column: ''
      },
      size: 500
    },
    duration: 50000
  },

  AND_LIST_TUMBLING_WINDOW: {
    filters: [FILTERS.AND_LIST],
    window: {
      emit: { type: 'TIME', every: 2000 }
    }
  }
};

export default QUERIES;
