import Flagship, {
  IFlagshipConfig,
  IFlagshipLogManager,
  LogLevel,
  Visitor,
} from "@flagship.io/js-sdk";
import {
  Hook,
  JsonValue,
  Logger,
  OpenFeatureEventEmitter,
  Provider,
  ProviderEvents,
  ProviderFatalError,
  ProviderMetadata,
  ResolutionDetails,
} from "@openfeature/server-sdk";
import { ABTastyResolver } from "./ABTastyResolver";
import { ToPrimitiveRecord } from "./functions";
import { FlagshipContext } from "./types";

export class AdapterLogger implements IFlagshipLogManager {
  private _logger: Logger;
  constructor(logger: Logger) {
    this._logger = logger;
  }

  emergency(message: string, tag: string): void {
    this._logger.error(`[${tag}] : ${message}`);
  }
  alert(message: string, tag: string): void {
    this._logger.error(`[${tag}] : ${message}`);
  }
  critical(message: string, tag: string): void {
    this._logger.error(`[${tag}] : ${message}`);
  }
  error(message: string, tag: string): void {
    this._logger.error(`[${tag}] : ${message}`);
  }
  warning(message: string, tag: string): void {
    this._logger.warn(`[${tag}] : ${message}`);
  }
  notice(message: string, tag: string): void {
    this._logger.warn(`[${tag}] : ${message}`);
  }
  info(message: string, tag: string): void {
    this._logger.info(`[${tag}] : ${message}`);
  }
  debug(message: string, tag: string): void {
    this._logger.debug(`[${tag}] : ${message}`);
  }
  log(level: LogLevel, message: string, tag: string): void {
    this._logger.debug(`[${tag}] : ${message}`);
  }
}

/**
 * The `ABTastyProvider` is an OpenFeature `Provider` implementation for the AB Tasty SDK.
 */
export class ABTastyProvider implements Provider {
  readonly runsOn = "server";
  readonly hooks: Hook[] = [];
  public readonly events = new OpenFeatureEventEmitter();
  private readonly _logger: AdapterLogger;

  readonly metadata: ProviderMetadata = {
    name: "abtasty-node-provider",
  };

  private _envID: string;
  private _apiKey: string;
  private _config: IFlagshipConfig;
  private _visitor: Visitor;

  private _resolver: ABTastyResolver;

  constructor(
    envId: string,
    apiKey: string,
    config?: IFlagshipConfig,
    logger?: Logger
  ) {
    this._envID = envId;
    this._apiKey = apiKey;

    if (!this._envID && !this._apiKey) {
      throw new ProviderFatalError(
        `ABTasty Client can not be created without envID or apiKey`
      );
    }

    if (config) {
      this._config = config;
    }

    if (logger) {
      this._logger = new AdapterLogger(logger);
    }

    Flagship.start(this._envID, this._apiKey, {
      ...this._config,
      logManager: this._logger,
      fetchNow: false,
    } as any);
  }

  async resolveBooleanEvaluation(
    flagKey: string,
    defaultValue: boolean,
    context: FlagshipContext,
    logger: Logger
  ): Promise<ResolutionDetails<boolean>> {
    return this._resolver.resolve({ flagKey, defaultValue, context, logger });
  }

  async resolveStringEvaluation(
    flagKey: string,
    defaultValue: string,
    context: FlagshipContext,
    logger: Logger
  ): Promise<ResolutionDetails<string>> {
    return this._resolver.resolve({ flagKey, defaultValue, context, logger });
  }

  async resolveNumberEvaluation(
    flagKey: string,
    defaultValue: number,
    context: FlagshipContext,
    logger: Logger
  ): Promise<ResolutionDetails<number>> {
    return this._resolver.resolve({ flagKey, defaultValue, context, logger });
  }

  async resolveObjectEvaluation<T extends JsonValue>(
    flagKey: string,
    defaultValue: T,
    context: FlagshipContext,
    logger: Logger
  ): Promise<ResolutionDetails<T>> {
    return this._resolver.resolve({
      flagKey,
      defaultValue,
      context,
      logger,
    });
  }

  async close(): Promise<void> {
    await Flagship.close();
  }

  public getConfig(): IFlagshipConfig {
    return Flagship.getConfig();
  }

  async initialize(context?: FlagshipContext | undefined): Promise<void> {
    const { fsVisitorInfo, targetingKey, ...userContext } = context || {};

    this._visitor = Flagship.newVisitor({
      ...fsVisitorInfo,
      visitorId: targetingKey,
      context: ToPrimitiveRecord(userContext),
    });

    await this._visitor.fetchFlags();

    this._resolver = new ABTastyResolver(this._visitor);
    this.events.emit(ProviderEvents.Ready);
  }
}
