const solc = require("solc");
const fs = require("fs");
const path = require("path");

// Read the contract source code
const contractPath = path.join(__dirname, "FlightDelayInsurance.sol");
const source = fs.readFileSync(contractPath, "utf8");

// Compile the contract
const input = {
  language: "Solidity",
  sources: {
    "FlightDelayInsurance.sol": {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      "*": {
        "*": ["*"],
      },
    },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

// Get the contract ABI and bytecode
const contract =
  output.contracts["FlightDelayInsurance.sol"]["FlightDelayInsurance"];
const abi = contract.abi;
const bytecode = contract.evm.bytecode.object;

// Save the ABI to a JSON file
fs.writeFileSync(
  path.join(__dirname, "FlightDelayInsurance.json"),
  JSON.stringify({ abi, bytecode }, null, 2)
);

console.log("Contract compiled successfully!");
