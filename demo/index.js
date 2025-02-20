//start demo
// Usage: node demo/index.js
const express = require("express");
const {
    ABTastyProvider,
} = require("@flagship.io/openfeature-node-server");
const { OpenFeature } = require("@openfeature/server-sdk");

const app = express();
app.use(express.json());

const visitorId = "visitor-id";

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

const port = 3000;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

//end demo
