import type {
  EventType as CoreEventType,
  IngestionEventInput as CoreIngestionEventInput,
  SourceType as CoreSourceType,
} from '../../../.local-memory/src/types/index.ts';
import type {
  EventType as PluginEventType,
  IngestionEventInput as PluginIngestionEventInput,
  SourceType as PluginSourceType,
} from './types.js';

type AssertAssignable<T extends true> = T;

type EventTypeMatches = AssertAssignable<
  PluginEventType extends CoreEventType
    ? CoreEventType extends PluginEventType
      ? true
      : false
    : false
>;

type SourceTypeMatches = AssertAssignable<
  PluginSourceType extends CoreSourceType
    ? CoreSourceType extends PluginSourceType
      ? true
      : false
    : false
>;

type IngestionEventInputMatches = AssertAssignable<
  PluginIngestionEventInput extends CoreIngestionEventInput
    ? CoreIngestionEventInput extends PluginIngestionEventInput
      ? true
      : false
    : false
>;

export type ContractChecks = EventTypeMatches | SourceTypeMatches | IngestionEventInputMatches;
