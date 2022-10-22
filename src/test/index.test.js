const assert = require("assert");
const { readFileSync } = require("fs");
const path = require("path");

const hl7 = require("../../dist/index.js").default;

const json = readFileSync(path.resolve(__dirname, "../examples/example.json"), "utf-8");
const messageText = readFileSync(path.resolve(__dirname, "../examples/example.txt"), "utf-8");

const message = hl7.parse(messageText);

try {
    assert.equal(JSON.stringify(JSON.parse(json)), JSON.stringify(message));
    console.log("\x1b[32m", "parse() test passed");
} catch (error) {
    console.error("\x1b[31m", "parse() test failed");
}

try {
    assert.equal(hl7.stringify(message), messageText);
    console.log("\x1b[32m", "strigify() test passed");
} catch (error) {
    console.error("\x1b[31m", "parse() test failed");
}




