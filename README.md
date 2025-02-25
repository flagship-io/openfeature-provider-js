# AB Tasty OpenFeature Provider for NodeJS

## Overview

This Provider allow the use of OpenFeature with Flagship, the platform to run experiments across all channels and devices and let the teams continuously optimize their product without risk in order to build better experiences and unlock new revenue opportunities.

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

:warning: The AB Tasty Provider **requires a targeting key** to be set. Often times this should be set when evaluating the value of a flag by [setting an EvaluationContext](https://openfeature.dev/docs/reference/concepts/evaluation-context) which contains the targeting key.

An example flag evaluation

```js
const client = openFeature.getClient();

const context: EvaluationContext = {
  targetingKey: "TARGETING_KEY",
};
const boolValue = await client.getBooleanValue("boolFlag", false, context);
```

## Contributing

Please read our [contributing guide](./CONTRIBUTING.md).

## License

Licensed under the Apache License, Version 2.0. See: [Apache License](http://www.apache.org/licenses/).

## About Feature Experimentation

​
<img src="https://www.flagship.io/wp-content/uploads/Flagship-horizontal-black-wake-AB.png" alt="drawing" width="150"/>
​
[Flagship by AB Tasty](https://www.flagship.io/) is a feature flagging platform for modern engineering and product teams. It eliminates the risks of future releases by separating code deployments from these releases :bulb: With Flagship, you have full control over the release process. You can:
​

- Switch features on or off through remote config.
- Automatically roll-out your features gradually to monitor performance and gather feedback from your most relevant users.
- Roll back any feature should any issues arise while testing in production.
- Segment users by granting access to a feature based on certain user attributes.
- Carry out A/B tests by easily assigning feature variations to groups of users.
  ​
  <img src="https://www.flagship.io/wp-content/uploads/demo-setup.png" alt="drawing" width="600"/>
  ​
  Flagship also allows you to choose whatever implementation method works for you from our many available SDKs or directly through a REST API. Additionally, our architecture is based on multi-cloud providers that offer high performance and highly-scalable managed services.
  ​
  **To learn more:**
  ​
- [Solution overview](https://www.flagship.io/#showvideo) - A 5mn video demo :movie_camera:
- [Website Documentation](https://docs.developers.flagship.io/) - Our dev portal with guides, how tos, API and SDK references
- [Command Documentation](https://flagship-io.github.io/abtasty-cli/documentation/abtasty-cli) - Command references
- [Sign up for a free trial](https://www.flagship.io/sign-up/) - Create your free account
- [Guide to feature flagging](https://www.flagship.io/feature-flags/) - Everything you need to know about feature flag related use cases
- [Blog](https://www.flagship.io/blog/) - Additional resources about release management
