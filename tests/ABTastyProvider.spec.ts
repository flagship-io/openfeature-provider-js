import {
  EvaluationContext,
  Logger,
  Metadata,
  ProviderFatalError,
  ResolutionDetails,
} from "@openfeature/server-sdk";
import {
  ABTastyProvider,
  ABTastyResolver,
  CacheStrategy,
  DecisionMode,
  Flagship,
  IFlagshipConfig,
  LogLevel,
  Visitor,
} from "../src";
import { AdapterLogger } from "../src/ABTastyProvider";

describe("ABTastyProvider", () => {
  const ENV_ID = "envId";
  const API_KEY = "apiKey";
  const FLAG_KEY = "flagKey";

  let resolverMock: jest.Mocked<ABTastyResolver>;
  let provider: ABTastyProvider;
  let loggerMock: jest.Mocked<Logger>;

  beforeEach(async () => {
    resolverMock = {
      resolve: jest.fn(),
    } as unknown as jest.Mocked<ABTastyResolver>;

    loggerMock = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    };

    provider = new ABTastyProvider(ENV_ID, API_KEY);
    await provider.initialize();

    provider["resolver"] = resolverMock;
  });

  it("throws ProviderFatalError when initialized with invalid credentials", () => {
    expect(() => new ABTastyProvider("", "")).toThrow(
      new ProviderFatalError(
        "ABTasty Client can not be created without envID or apiKey"
      )
    );
  });

  it("returns correct metadata from getMetadata", () => {
    const metadata: Metadata = provider.metadata;
    expect(metadata.name).toBe("abtasty-node-provider");
  });

  const setupResolverMock = (expectedValue: any): void => {
    resolverMock.resolve.mockReturnValue(
      (async () => ({
        value: expectedValue,
      }))()
    );
  };

  const assertResult = <T>(result: ResolutionDetails<T>, expectedValue: T) => {
    expect(result).toBeDefined();
    if (result) {
      expect(result.value).toBe(expectedValue);
      expect(result.errorCode).toBeUndefined();
      expect(result.errorMessage).toBeUndefined();
    }
  };

  it("resolveBooleanEvaluation returns the correct value", async () => {
    const defaultValue = false;
    const expectedValue = true;
    setupResolverMock(expectedValue);

    const result = await provider.resolveBooleanEvaluation(
      FLAG_KEY,
      defaultValue,
      {},
      loggerMock
    );
    assertResult(result, expectedValue);
  });

  it("resolveNumberEvaluation returns the correct value", async () => {
    const defaultValue = 0.5;
    const expectedValue = 2.5;
    setupResolverMock(expectedValue);

    const result = await provider.resolveNumberEvaluation(
      FLAG_KEY,
      defaultValue,
      {},
      loggerMock
    );
    assertResult(result, expectedValue);
  });

  it("resolveNumberEvaluation returns the correct value", async () => {
    const defaultValue = 1;
    const expectedValue = 2;
    setupResolverMock(expectedValue);

    const result = await provider.resolveNumberEvaluation(
      FLAG_KEY,
      defaultValue,
      {},
      loggerMock
    );
    assertResult(result, expectedValue);
  });

  it("resolveStringEvaluation returns the correct value", async () => {
    const defaultValue = "1";
    const expectedValue = "2";
    setupResolverMock(expectedValue);

    const result = await provider.resolveStringEvaluation(
      FLAG_KEY,
      defaultValue,
      {},
      loggerMock
    );
    assertResult(result, expectedValue);
  });

  it.each([[{ 1: "1" }, { 1: "1" }]])(
    `resolveObjectEvaluation returns the correct value`,
    async (defaultValue, expectedValue) => {
      const defaultValueABTasty = defaultValue;
      const expectedValueOpenfeature = expectedValue;
      const ABTastyValue = expectedValue;

      setupResolverMock(ABTastyValue);

      const result = await provider.resolveObjectEvaluation(
        FLAG_KEY,
        defaultValueABTasty,
        {},
        loggerMock
      );

      expect(result.value).toEqual(expectedValueOpenfeature);
      expect(result.errorCode).toBeUndefined();
      expect(result.errorMessage).toBeUndefined();
    }
  );

  it("instantiate with config", async () => {
    const config = {
      decisionMode: DecisionMode.BUCKETING,
      fetchNow: false,
      timeout: 10,
      logLevel: LogLevel.INFO,
      pollingInterval: 100,
      hitDeduplicationTime: 0,
      trackingManagerConfig: {
        cacheStrategy: CacheStrategy.PERIODIC_CACHING,
        poolMaxSize: 10,
        batchIntervals: 100,
      },
      initialBucketing: {},
      onBucketingFail: function (error) {
        throw new ProviderFatalError(
          `AB Tasty client is not created bucket failed}`
        );
      },
      onBucketingUpdated: function (lastUpdate) {
        console.log(lastUpdate);
      },
      onLog: (level, tag, message) => {
        console.log(`[${LogLevel[level]}] [${tag}] : ${message}`);
      },
    } as IFlagshipConfig;

    let provider = new ABTastyProvider(ENV_ID, API_KEY, config);
    await provider.initialize();

    expect(provider.getConfig().apiKey).toContain(API_KEY);
    expect(provider.getConfig().envId).toContain(ENV_ID);
    expect(provider.getConfig().decisionMode).toContain(DecisionMode.BUCKETING);
  });

  it("instantiate with logger", async () => {
    loggerMock.info("Testing Info...");
    let provider = new ABTastyProvider(ENV_ID, API_KEY, {}, loggerMock);
    await provider.initialize();

    expect(loggerMock.info).toHaveBeenCalledWith("Testing Info...");
  });

  it("instantiate with logger", async () => {
    loggerMock.info("Testing Info...");
    loggerMock.debug("Testing Debug...");
    loggerMock.error("Testing Error...");
    loggerMock.warn("Testing Warn...");
    let provider = new ABTastyProvider(ENV_ID, API_KEY, {}, loggerMock);
    await provider.initialize();

    expect(loggerMock.info).toHaveBeenCalledWith("Testing Info...");
    expect(loggerMock.debug).toHaveBeenCalledWith("Testing Debug...");
    expect(loggerMock.warn).toHaveBeenCalledWith("Testing Warn...");
    expect(loggerMock.error).toHaveBeenCalledWith("Testing Error...");
  });

  it("test error adapter logger", async () => {
    const adapterLog = new AdapterLogger(loggerMock);
    adapterLog.emergency("Testing Emergency...", "");
    adapterLog.alert("Testing Alert...", "");
    adapterLog.critical("Testing Critical...", "");

    expect(loggerMock.error).toHaveBeenCalledTimes(3);
    expect(loggerMock.error).toHaveBeenCalledWith("[] : Testing Emergency...");
    expect(loggerMock.error).toHaveBeenCalledWith("[] : Testing Alert...");
    expect(loggerMock.error).toHaveBeenCalledWith("[] : Testing Critical...");
  });

  it("test warn adapter logger", async () => {
    const adapterLog = new AdapterLogger(loggerMock);
    adapterLog.warning("Testing Warning...", "");
    adapterLog.notice("Testing Notice...", "");

    expect(loggerMock.warn).toHaveBeenCalledTimes(2);
    expect(loggerMock.warn).toHaveBeenCalledWith("[] : Testing Warning...");
    expect(loggerMock.warn).toHaveBeenCalledWith("[] : Testing Notice...");
  });

  it("test debug adapter debug", async () => {
    const adapterLog = new AdapterLogger(loggerMock);
    adapterLog.debug("Testing Debug...", "");
    adapterLog.log(LogLevel.NOTICE, "Testing Log...", "");

    expect(loggerMock.debug).toHaveBeenCalledTimes(2);
    expect(loggerMock.debug).toHaveBeenCalledWith("[] : Testing Debug...");
    expect(loggerMock.debug).toHaveBeenCalledWith("[] : Testing Log...");
  });

  it("updateContext", async () => {
    await provider.initialize({
      targetingKey: "new key",
    } as EvaluationContext);
  });

  it("Get client", async () => {
    const client = provider.getClient();
    expect(client.getStatus()).toBe(Flagship.getStatus());
  });

  it("Get visitor", async () => {
    expect(provider.getVisitor()).toBeInstanceOf(Visitor);
  });

  it("Close", async () => {
    await provider.close();
  });
});
