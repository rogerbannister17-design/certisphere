import { InvalidDocumentStateTransitionError } from './errors.js';
import type { LifecycleState } from './value-objects.js';

const allowedTransitions = new Map<LifecycleState, ReadonlySet<LifecycleState>>([
  ['DRAFT', new Set<LifecycleState>(['IN_REVIEW', 'ARCHIVED'])],
  ['IN_REVIEW', new Set<LifecycleState>(['DRAFT', 'APPROVED', 'ARCHIVED'])],
  ['APPROVED', new Set<LifecycleState>(['PUBLISHED', 'DRAFT', 'ARCHIVED'])],
  ['PUBLISHED', new Set<LifecycleState>(['SUPERSEDED', 'WITHDRAWN', 'OBSOLETE'])],
  ['SUPERSEDED', new Set<LifecycleState>(['ARCHIVED'])],
  ['WITHDRAWN', new Set<LifecycleState>(['ARCHIVED'])],
  ['OBSOLETE', new Set<LifecycleState>(['ARCHIVED'])],
  ['ARCHIVED', new Set<LifecycleState>(['DRAFT'])],
]);

export class Lifecycle {
  private constructor(readonly state: LifecycleState) {}

  static draft(): Lifecycle {
    return new Lifecycle('DRAFT');
  }

  static from(state: LifecycleState): Lifecycle {
    return new Lifecycle(state);
  }

  transitionTo(next: LifecycleState): Lifecycle {
    const allowed = allowedTransitions.get(this.state);
    if (allowed?.has(next) !== true) {
      throw new InvalidDocumentStateTransitionError(this.state, next);
    }

    return new Lifecycle(next);
  }
}
