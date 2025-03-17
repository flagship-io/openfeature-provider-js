# AB Tasty OpenFeature Provider for NodeJS

> [!WARNING]
> This is a beta version, it may still contain some bugs and imperfections and should not be considered ready for production.

## Overview

This Provider allow the use of OpenFeature with AB Tasty Feature experimentation & Rollout (ex Flagship). AB Tasty FE&R is a feature flagging platform for modern engineering and product teams. It eliminates the risks of future releases by separating code deployments from these releases :bulb: With AB Tasty FE&R, you have full control over the release process. You can:
​

- Switch features on or off through remote config.
- Automatically roll-out your features gradually to monitor performance and gather feedback from your most relevant users.
- Roll back any feature should any issues arise while testing in production.
- Segment users by granting access to a feature based on certain user attributes.
- Carry out A/B tests by easily assigning feature variations to groups of users.

👉 Get started: https://docs.developers.flagship.io/docs/getting-started-with-flagship#/

👉 AB Tasty FE&R SDK Key feature: https://docs.developers.flagship.io/docs/key-features#/

## Getting started

Below is a simple example that describes the instantiation of the AB Tasty Provider. Please see the [OpenFeature Documentation](https://docs.openfeature.dev/docs/reference/concepts/evaluation-api) for details on how to use the OpenFeature SDK.

### Add the AB Tasty provider

```sh
npm install @flagship-io/openfeature-provider-js
```

### Confirm peer dependencies are installed

```sh
npm install @openfeature/server-sdk
```

### Register the AB Tasty provider with OpenFeature

```js
const { ABTastyProvider } = require("@flagship.io/openfeature-provider-js");
const { OpenFeature } = require("@openfeature/server-sdk");
const provider = new ABTastyProvider("<ENV_ID>", "<API_KEY>");
await OpenFeature.setProviderAndWait(provider);
```

## Use of OpenFeature with AB Tasty

After the initial setup you can use OpenFeature according to their [documentation](https://openfeature.dev/docs/reference/concepts/evaluation-api).

An example flag evaluation

```js
const client = openFeature.getClient();

const context: EvaluationContext = {
  targetingKey: "TARGETING_KEY",
  contextKey: "CONTEXT_VALUE",
};
const boolValue = await client.getBooleanValue("boolFlag", false, context);
```

### Server environment

:warning: When running your server in a TypeScript environment, it's essential to call setProviderAndWait within each endpoint to ensure that every request creates a new visitor context with up-to-date feature flag values. This method initializes a new visitor—using the provided targeting key and any additional context—and fetches the latest flag configurations before any flag evaluations occur. Without this step, subsequent requests might operate on outdated visitor data, leading to inconsistent or stale flag evaluations. For more information, please refers to our [JS SDK documentation](https://docs.developers.flagship.io/docs/javascript#/).

An example of this implementation

```js
// Step 1: Start the OpenFeature SDK by providing the environment ID and API key
let provider = new ABTastyProvider("<ENV_ID>", "<API_KEY>");

const client = OpenFeature.getClient();

// Endpoint to get an item
app.get("/item", async (req, res) => {
  // Step 2: Create a new evaluation with a targeting key (visitor ID) and visitor context
  const evaluationContext = {
    targetingKey: visitorId,
    fs_is_vip: true,
  };

  // Step 3: Set context for OpenFeature instance
  OpenFeature.setContext(evaluationContext);

  // Step 4: Set Flagship SDK as provider
  await OpenFeature.setProviderAndWait(provider);

  // Step 5: Get the values of the flags for the visitor
  const fsEnableDiscountValue = await client.getBooleanValue(
    "fs_enable_discount",
    false,
    evaluationContext
  );
  const fsAddToCartBtnColorValue = await client.getStringValue(
    "fs_add_to_cart_btn_color",
    "blue",
    evaluationContext
  );
  const flagNumberValue = await client.getNumberValue(
    "flag_number",
    0,
    evaluationContext
  );
  const flagObjectValue = await client.getObjectValue(
    "flag_object",
    {},
    evaluationContext
  );
  const flagArrayValue = await client.getObjectValue(
    "flag_array",
    [],
    evaluationContext
  );

  res.json({
    item: {
      name: "Flagship T-shirt",
      price: 20,
    },
    fsEnableDiscount: fsEnableDiscountValue,
    fsAddToCartBtnColor: fsAddToCartBtnColorValue,
    flagNumberValue: flagNumberValue,
    flagObjectValue: flagObjectValue,
    flagArrayValue: flagArrayValue,
  });
});
```

## Contributing

Please read our [contributing guide](./CONTRIBUTING.md).

## License

Licensed under the Apache License, Version 2.0. See: [Apache License](http://www.apache.org/licenses/).
