import Flagship, { FSFetchStatus, Visitor } from "@flagship.io/js-sdk";
import { StandardResolutionReasons } from "@openfeature/core";
import { ErrorCode, ResolutionDetails } from "@openfeature/server-sdk";
import { AdapterLogger } from "./ABTastyProvider";
import { ToPrimitiveRecord } from "./functions";
import { ResolutionDetailsParams, ResolveParams, Resolver } from "./types";

export class ABTastyResolver implements Resolver {
  private visitor: Visitor;

  constructor(visitor: Visitor) {
    this.visitor = visitor;
  }

  async resolve<T>({
    flagKey,
    defaultValue,
    context,
    logger,
  }: ResolveParams<T>): Promise<ResolutionDetails<T>> {
    try {
      if (context.targetingKey) {
        this.visitor.visitorId = context.targetingKey;
      }

      if (logger) {
        const conf = Flagship.getConfig();
        conf.logManager = new AdapterLogger(logger);
      }

      const userContext = ToPrimitiveRecord(context);
      if (userContext) {
        this.visitor.updateContext(userContext);
        if (this.visitor.fetchStatus.status === FSFetchStatus.FETCH_REQUIRED) {
          await this.visitor.fetchFlags();
        }
      }

      var value = this.visitor.getFlag(flagKey).getValue(defaultValue);
      var visitorID = this.visitor.visitorId;

      return this.formatResolutionDetails({
        value: value as T,
        variant: visitorID,
      });
    } catch (exception) {
      return this.formatResolutionDetails({
        value: defaultValue,
        errorCode: ErrorCode.GENERAL,
        errorMessage: exception.message,
      });
    }
  }

  private formatResolutionDetails<T>({
    value,
    variant,
    errorCode,
    errorMessage,
  }: ResolutionDetailsParams<T>): ResolutionDetails<T> {
    return {
      value: value,
      variant: variant,
      reason: StandardResolutionReasons.STATIC,
      errorCode: errorCode,
      errorMessage: errorMessage,
    };
  }
}
