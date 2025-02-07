const express = require("express");
const axios = require("axios");
require("dotenv").config();
const app = express();
const port = 5000;
const cors = require("cors");
app.use(cors());
const RPC_USER = process.env.RPC_USER;
const RPC_PASSWORD = process.env.RPC_PASSWORD;
const RPC_URL = process.env.RPC_URL;

const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const getBitcoinData = async (method, params = []) => {
  try {
    const response = await axios.post(
      RPC_URL,
      {
        jsonrpc: "1.0",
        id: "curltest",
        method: method,
        params: params,
      },
      {
        auth: {
          username: RPC_USER,
          password: RPC_PASSWORD,
        },
      }
    );
    return response.data.result;
  } catch (error) {
    console.error("Error connecting to Bitcoin Core API:", error);
    return null;
  }
};

app.get("/bitcoin-dashboard", async (req, res) => {
  try {
    const blockchainInfo = await getBitcoinData("getblockchaininfo");

    const response = {
      priceUSD: 0,
      blockHeight: blockchainInfo.blocks,
      difficulty: (blockchainInfo.difficulty / 1e12).toFixed(2) + " TH",

      supply: blockchainInfo.verificationprogress * 21000000,
      maxSupply: 21000000,
    };
    res.json(response);
  } catch (error) {
    console.error("Error fetching Bitcoin data:", error);
    res.status(500).json({ error: "Failed to fetch Bitcoin data" });
  }
});

app.get("/latest-blocks", async (req, res) => {
  try {
    const blockchainInfo = await getBitcoinData("getblockchaininfo");
    const latestBlocks = [];
    const latestBlockHeight = blockchainInfo.blocks;

    //const btcToUsd = await axios.get(
    //  "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
    //);
    const btcToUsd = 90514;

    for (let i = 0; i < 10; i++) {
      const blockHash = await getBitcoinData("getblockhash", [
        latestBlockHeight - i,
      ]);
      const block = await getBitcoinData("getblock", [blockHash, 2]);

      const coinbaseTx = block.tx[0];
      const blockReward = coinbaseTx.vout.reduce(
        (sum, output) => sum + output.value,
        0
      );
      latestBlocks.push({
        hash: block.hash,
        height: block.height,
        size: block.size,
        transactions: block.tx.length,
        rewardBTC: blockReward.toFixed(8),
        rewardUSD: (blockReward * btcToUsd).toFixed(2),
        minedDateTime: new Date(block.time * 1000).toLocaleString(),
      });
    }
    res.json(latestBlocks);
  } catch (error) {
    console.error("Greška kod dohvaćanja blokova:", error);
    res.status(500).json({ error: "Greška kod dohvaćanja podataka." });
  }
});

app.get("/block-hash/:hash", async (req, res) => {
  const { hash } = req.params;

  try {
    const block = await getBitcoinData("getblock", [hash, 2]);
    res.json(block);
  } catch (err) {
    console.error("Error fetching block:", err);
    res.status(404).json({ error: "Block not found." });
  }
});

app.get("/generate-graph", (req, res) => {
  const pythonScriptPath = path.join(__dirname, "script.py"); // Putanja do Python skripte

  exec(`python3 ${pythonScriptPath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing Python script: ${error}`);
      return res.status(500).send("Error generating graph");
    }

    // Izlaz Python skripte daje putanju do spremljene slike
    const imagePath = stdout.trim(); // Ovdje uzimamo putanju
    if (fs.existsSync(imagePath)) {
      res.sendFile(imagePath); // Slanje slike kao odgovor
    } else {
      res.status(500).send("Error generating graph image");
    }
  });
});

app.get("/block-height/:height", async (req, res) => {
  const { height } = req.params;

  try {
    const hash = await getBitcoinData("getblockhash", [parseInt(height)]);
    const block = await getBitcoinData("getblock", [hash, 2]);
    res.json(block);
  } catch (err) {
    console.error("Error fetching block:", err);
    res.status(404).json({ error: "Block not found." });
  }
});

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchVinData = async (vin) => {
  if (vin.txid && vin.vout !== undefined) {
    try {
      let previousTransaction;
      let retries = 3;
      let success = false;

      while (retries > 0 && !success) {
        try {
          previousTransaction = await getBitcoinData("getrawtransaction", [
            vin.txid,
            true,
          ]);
          if (
            previousTransaction &&
            previousTransaction.vout &&
            previousTransaction.vout[vin.vout] !== undefined
          ) {
            success = true;
          }
        } catch (err) {
          console.error(
            `Error fetching previous transaction ${vin.txid}:`,
            err
          );
          retries--;
          if (retries > 0) {
            console.log("Retrying...");
            await delay(3000);
          }
        }
      }

      if (!success) {
        return {
          ...vin,
          address: "Failed after retries",
          value: 0,
        };
      }

      const previousVout = previousTransaction.vout[vin.vout];
      const scriptPubKey = previousVout.scriptPubKey || {};

      let address = scriptPubKey.address;
      if (!address && scriptPubKey.asm) {
        address = `ASM: ${scriptPubKey.asm}`;
      }

      const value = previousVout.value || 0;

      return {
        ...vin,
        address: address || "Address not available",
        value: value,
      };
    } catch (err) {
      console.error(`Error fetching previous transaction ${vin.txid}:`, err);
      return {
        ...vin,
        address: "Error fetching address",
        value: 0,
      };
    }
  } else {
    return {
      ...vin,
      address: "Coinbase",
      value: 0,
    };
  }
};

app.get("/transaction/:txid", async (req, res) => {
  const { txid } = req.params;

  try {
    const transaction = await getBitcoinData("getrawtransaction", [txid, true]);

    const vinWithAddresses = await Promise.all(
      transaction.vin.map(fetchVinData)
    );

    const totalInputValue = vinWithAddresses
      .reduce((acc, vin) => {
        const value = parseFloat(vin.value) || 0;
        return acc + value;
      }, 0)
      .toFixed(8);

    const voutWithAddresses = transaction.vout.map((vout) => {
      const scriptPubKey = vout.scriptPubKey || {};
      return {
        ...vout,
        address: scriptPubKey.address || "Address not available - op_return",
      };
    });

    const totalOutputValue = voutWithAddresses
      .reduce((acc, vout) => {
        const value = parseFloat(vout.value) || 0;
        return acc + value;
      }, 0)
      .toFixed(8);

    const minerFee = Math.abs(
      parseFloat(totalInputValue) - parseFloat(totalOutputValue)
    ).toFixed(8);

    res.json({
      ...transaction,
      vin: vinWithAddresses,
      vout: voutWithAddresses,
      totalInputValue,
      totalOutputValue,
      minerFee,
    });
  } catch (err) {
    console.error("Error fetching transaction:", err);
    res.status(404).json({ error: "Transaction not found." });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
