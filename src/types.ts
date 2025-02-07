import Flagship from "@flagship.io/js-sdk";
import {
  EvaluationContext,
  Logger,
  ResolutionDetails,
} from "@openfeature/core";
import { ErrorCode } from "@openfeature/server-sdk";

export interface Resolver {
  resolve<T>({
    flagKey,
    defaultValue,
    context,
    logger,
  }: ResolveParams<T>): Promise<ResolutionDetails<T>>;
}

export type ResolveParams<T> = {
  flagKey: string;
  defaultValue: T;
  context: EvaluationContext;
  logger?: Logger;
};

export type ABTastyClient = Flagship;

export type ResolutionDetailsParams<T> = {
  value: T;
  variant?: string;
  errorCode?: ErrorCode;
  errorMessage?: string;
};
