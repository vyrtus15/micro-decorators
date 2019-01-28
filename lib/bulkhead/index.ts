import {
  BulkheadOptions,
  DEFAULT_SCOPE,
  DEFAULT_ON_ERROR,
} from './BulkheadOptions';
import { createScope } from './scopes';
import { raiseStrategy } from '../utils';

export { BulkheadOptions };

/**
 * Limits the number of queued concurrent executions of a method.
 * When the limit is reached the execution is delayed and queued.
 * @param threshold the max number of concurrent executions.
 * @param options (optional) additional options,
 * defaults to {scope: 'instance', error: 'throw'}
 */

export function bulkhead(
  size: number,
  options?: BulkheadOptions) {

  return function (target: any, propertyKey: any, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    const raise = raiseStrategy(options, DEFAULT_ON_ERROR);
    const scope = createScope(
      options && options.scope || DEFAULT_SCOPE,
      size);

    descriptor.value = function () {
      const bulkhead = scope.bulkhead(this);
      if (!bulkhead.pass()) {
        return raise(new Error('Throttle limit exceeded.'));
      }

      return method.apply(this, arguments);
    };
  };
}