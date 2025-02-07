import { Logger } from "@openfeature/server-sdk";
import { ABTastyProvider, ABTastyResolver, Flagship } from "../src";
import { ResolveParams } from "../src/types";

export enum ErrorCode {
  GENERAL = "GENERAL",
}

export enum StandardResolutionReasons {
  STATIC = "STATIC",
}

type PartialVisitor = {
  visitorId: string;
  updateContext: jest.Mock<any, any>;
  fetchFlags: jest.Mock<any, any>;
  getFlag: jest.Mock<any, any>;
};

describe("ABTastyResolver", () => {
  let visitorMock: PartialVisitor;
  let resolver: ABTastyResolver;
  let loggerMock: jest.Mocked<Logger>;

  beforeEach(async () => {
    visitorMock = {
      visitorId: "user456",
      updateContext: jest.fn(),
      fetchFlags: jest.fn().mockResolvedValue(undefined),
      getFlag: jest.fn(),
    };

    loggerMock = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    };

    let provider = new ABTastyProvider("ENV_ID", "API_KEY");
    await provider.initialize();

    resolver = new ABTastyResolver(visitorMock as unknown as any);
  });

  it("should resolve flag boolean value successfully", async () => {
    const flagKey = "testFlag";
    const defaultValue = false;
    const context = { targetingKey: "user123", extraData: "value" };

    const expectedFlagValue = true;
    visitorMock.getFlag.mockReturnValue({
      getValue: jest.fn().mockReturnValue(expectedFlagValue),
    });

    const result = await resolver.resolve({
      flagKey,
      defaultValue,
      context,
      logger: loggerMock,
    } as ResolveParams<boolean>);

    expect(visitorMock.visitorId).toBe(context.targetingKey);
    expect(visitorMock.updateContext).toHaveBeenCalledWith(
      expect.objectContaining(context)
    );
    expect(visitorMock.fetchFlags).toHaveBeenCalled();
    expect(result).toEqual({
      value: expectedFlagValue,
      variant: visitorMock.visitorId,
      reason: StandardResolutionReasons.STATIC,
      errorCode: undefined,
      errorMessage: undefined,
    });
  });

  it("should resolve flag number value successfully", async () => {
    const flagKey = "testFlag";
    const defaultValue = 12;
    const context = { targetingKey: "user123", extraData: "value" };

    const expectedFlagValue = true;
    visitorMock.getFlag.mockReturnValue({
      getValue: jest.fn().mockReturnValue(expectedFlagValue),
    });

    const result = await resolver.resolve({
      flagKey,
      defaultValue,
      context,
      logger: loggerMock,
    });

    expect(visitorMock.visitorId).toBe(context.targetingKey);
    expect(visitorMock.updateContext).toHaveBeenCalledWith(
      expect.objectContaining(context)
    );
    expect(visitorMock.fetchFlags).toHaveBeenCalled();
    expect(result).toEqual({
      value: expectedFlagValue,
      variant: visitorMock.visitorId,
      reason: StandardResolutionReasons.STATIC,
      errorCode: undefined,
      errorMessage: undefined,
    });
  });

  it("should resolve flag string value successfully", async () => {
    const flagKey = "testFlag";
    const defaultValue = "testDefaultValue";
    const context = { targetingKey: "user123", extraData: "value" };

    const expectedFlagValue = true;
    visitorMock.getFlag.mockReturnValue({
      getValue: jest.fn().mockReturnValue(expectedFlagValue),
    });

    const result = await resolver.resolve({
      flagKey,
      defaultValue,
      context,
      logger: loggerMock,
    });

    expect(visitorMock.visitorId).toBe(context.targetingKey);
    expect(visitorMock.updateContext).toHaveBeenCalledWith(
      expect.objectContaining(context)
    );
    expect(visitorMock.fetchFlags).toHaveBeenCalled();
    expect(result).toEqual({
      value: expectedFlagValue,
      variant: visitorMock.visitorId,
      reason: StandardResolutionReasons.STATIC,
      errorCode: undefined,
      errorMessage: undefined,
    });
  });

  it("should resolve flag object value successfully", async () => {
    const flagKey = "testFlag";
    const defaultValue = { value: "testObjectValue" };
    const context = { targetingKey: "user123", extraData: "value" };

    const expectedFlagValue = true;
    visitorMock.getFlag.mockReturnValue({
      getValue: jest.fn().mockReturnValue(expectedFlagValue),
    });

    const result = await resolver.resolve({
      flagKey,
      defaultValue,
      context,
      logger: loggerMock,
    });

    expect(visitorMock.visitorId).toBe(context.targetingKey);
    expect(visitorMock.updateContext).toHaveBeenCalledWith(
      expect.objectContaining(context)
    );
    expect(visitorMock.fetchFlags).toHaveBeenCalled();
    expect(result).toEqual({
      value: expectedFlagValue,
      variant: visitorMock.visitorId,
      reason: StandardResolutionReasons.STATIC,
      errorCode: undefined,
      errorMessage: undefined,
    });
  });

  it("should resolve flag boolean value successfully", async () => {
    const flagKey = "testFlag";
    const defaultValue = false;
    const context = { targetingKey: "user123", extraData: "value" };

    const expectedFlagValue = true;
    visitorMock.getFlag.mockReturnValue({
      getValue: jest.fn().mockReturnValue(expectedFlagValue),
    });

    const result = await resolver.resolve({
      flagKey,
      defaultValue,
      context,
    });

    expect(visitorMock.visitorId).toBe(context.targetingKey);
    expect(visitorMock.updateContext).toHaveBeenCalledWith(
      expect.objectContaining(context)
    );
    expect(visitorMock.fetchFlags).toHaveBeenCalled();
    expect(result).toEqual({
      value: expectedFlagValue,
      variant: visitorMock.visitorId,
      reason: StandardResolutionReasons.STATIC,
      errorCode: undefined,
      errorMessage: undefined,
    });
  });

  /*   it("should resolve with logger a flag boolean value successfully", async () => {
    const flagKey = "testFlag";
    const defaultValue = false;
    const context = { targetingKey: "user123", extraData: "value" };

    const expectedFlagValue = true;
    visitorMock.getFlag.mockReturnValue({
      getValue: jest.fn().mockReturnValue(expectedFlagValue),
    });

    const result = await resolver.resolve({
      flagKey,
      defaultValue,
      context,
    });

    expect(visitorMock.visitorId).toBe(context.targetingKey);
    expect(visitorMock.updateContext).toHaveBeenCalledWith(
      expect.objectContaining(context)
    );
    expect(visitorMock.fetchFlags).toHaveBeenCalled();
    expect(result).toEqual({
      value: expectedFlagValue,
      variant: visitorMock.visitorId,
      reason: StandardResolutionReasons.STATIC,
      errorCode: undefined,
      errorMessage: undefined,
    });
  }); */

  it("should resolve with default value and error details when an Error is thrown", async () => {
    const flagKey = "testFlag";
    const defaultValue = 42;
    const context = { targetingKey: "user456" };
    const errorMessage = "Fetch failed";

    visitorMock.fetchFlags.mockRejectedValue(new Error(errorMessage));

    const result = await resolver.resolve({
      flagKey,
      defaultValue,
      context,
      logger: undefined,
    });

    expect(result).toEqual({
      value: defaultValue,
      variant: undefined,
      reason: StandardResolutionReasons.STATIC,
      errorCode: ErrorCode.GENERAL,
      errorMessage: errorMessage,
    });
  });

  it("should resolve with default value and generic error message when a non-Error is thrown", async () => {
    const flagKey = "testFlag";
    const defaultValue = "default";
    const context = { targetingKey: "user789" };

    visitorMock.fetchFlags.mockRejectedValue("Non-Error exception");

    const result = await resolver.resolve({
      flagKey,
      defaultValue,
      context,
      logger: undefined,
    });

    expect(result).toEqual({
      value: defaultValue,
      variant: undefined,
      reason: StandardResolutionReasons.STATIC,
      errorCode: ErrorCode.GENERAL,
      errorMessage: "An unexpected error occurred.",
    });
  });
});
