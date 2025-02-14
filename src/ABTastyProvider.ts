import Flagship, {
  IFlagshipConfig,
  IFlagshipLogManager,
  LogLevel,
  Visitor,
} from "@flagship.io/js-sdk";
import {
  EvaluationContext,
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
import { ABTastyClient, Resolver } from "./types";

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

  private _client: ABTastyClient;
  private _visitor: Visitor;
  private _envID: string;
  private _apiKey: string;
  private _config: IFlagshipConfig;

  private resolver: Resolver;

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
  }

  async resolveBooleanEvaluation(
    flagKey: string,
    defaultValue: boolean,
    context: EvaluationContext,
    logger: Logger
  ): Promise<ResolutionDetails<boolean>> {
    return this.resolver.resolve({ flagKey, defaultValue, context, logger });
  }

  async resolveStringEvaluation(
    flagKey: string,
    defaultValue: string,
    context: EvaluationContext,
    logger: Logger
  ): Promise<ResolutionDetails<string>> {
    return this.resolver.resolve({ flagKey, defaultValue, context, logger });
  }

  async resolveNumberEvaluation(
    flagKey: string,
    defaultValue: number,
    context: EvaluationContext,
    logger: Logger
  ): Promise<ResolutionDetails<number>> {
    return this.resolver.resolve({ flagKey, defaultValue, context, logger });
  }

  async resolveObjectEvaluation<T extends JsonValue>(
    flagKey: string,
    defaultValue: T,
    context: EvaluationContext,
    logger: Logger
  ): Promise<ResolutionDetails<T>> {
    return this.resolver.resolve({
      flagKey,
      defaultValue,
      context,
      logger,
    });
  }

  public getClient(): ABTastyClient {
    return this._client;
  }

  public getVisitor(): Visitor {
    return this._visitor;
  }

  async close(): Promise<void> {
    await this._client.close();
  }

  public getConfig(): IFlagshipConfig {
    return this._client.getConfig();
  }

  async initialize(context?: EvaluationContext | undefined): Promise<void> {
    this._client = await Flagship.start(this._envID, this._apiKey, {
      ...this._config,
      logManager: this._logger,
      fetchNow: false,
    } as any);

    this._visitor = this._client.newVisitor({
      isAuthenticated: true,
      hasConsented: true,
      ...(context && context.targetingKey
        ? { visitorId: context.targetingKey }
        : {}),
      ...(context ? { context: ToPrimitiveRecord(context) } : {}),
      onFetchFlagsStatusChanged({ status, reason }) {},
    });

    await this._visitor.fetchFlags();
    this.resolver = new ABTastyResolver(this._visitor);
    this.events.emit(ProviderEvents.Ready);
  }
}
