import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  IconButton,
  CircularProgress,
  Typography,
  Button,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Link } from "react-router-dom";
import LatestBlocksStatistic from "./LastestBlocksStatistic";

const LatestBlocks = () => {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [blocks2, setBlocks2] = useState([]);

  const calculateAverageTransactionsPerBlock = (blocks) => {
    let totalTransactions = 0;
    for (let i = 0; i < blocks.length; i++) {
      totalTransactions += blocks[i].transactions;
    }
    return totalTransactions / blocks.length;
  };

  const calculateTotalTransactions = (blocks) => {
    return blocks.reduce((acc, block) => acc + block.transactions, 0);
  };

  const calculateAverageReward = (blocks) => {
    let totalBTC = 0;
    let totalUSD = 0;
    for (let i = 0; i < blocks.length; i++) {
      totalBTC += parseFloat(blocks[i].rewardBTC);
      totalUSD += parseFloat(blocks[i].rewardUSD);
    }
    return {
      averageBTC: totalBTC / blocks.length,
      averageUSD: totalUSD / blocks.length,
    };
  };

  const calculateAverageBlockSize = (blocks) => {
    let totalSize = 0;
    for (let i = 0; i < blocks.length; i++) {
      totalSize += blocks[i].size;
    }
    return totalSize / blocks.length;
  };

  const parseCustomDate = (dateStr) => {
    const [date, time] = dateStr.split(", ");
    const [day, month, year] = date.split("/");
    return new Date(`${year}-${month}-${day}T${time}`);
  };

  const calculateAverageTimeBetweenBlocks = (blocks) => {
    if (!blocks || blocks.length < 2) {
      throw new Error(
        "Nije moguće izračunati prosječno vrijeme s manje od 2 bloka."
      );
    }

    blocks.forEach((block) => {
      const parsedDate = parseCustomDate(block.minedDateTime);
      if (isNaN(parsedDate.getTime())) {
        throw new Error(
          `Nevažeći datum u minedDateTime za blok: ${JSON.stringify(block)}`
        );
      }
    });

    const sortedBlocks = [...blocks].sort(
      (a, b) =>
        parseCustomDate(a.minedDateTime).getTime() -
        parseCustomDate(b.minedDateTime).getTime()
    );

    let totalTimeDiff = 0;
    for (let i = 1; i < sortedBlocks.length; i++) {
      const currentBlockTime = parseCustomDate(
        sortedBlocks[i].minedDateTime
      ).getTime();
      const previousBlockTime = parseCustomDate(
        sortedBlocks[i - 1].minedDateTime
      ).getTime();
      const timeDiff = currentBlockTime - previousBlockTime;

      totalTimeDiff += timeDiff;
    }

    return formatTimeDifference(totalTimeDiff / (sortedBlocks.length - 1));
  };

  const formatTimeDifference = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours} h ${minutes % 60} min ${seconds % 60} sec`;
    if (minutes > 0) return `${minutes} min ${seconds % 60} sec`;
    return `${seconds} sec`;
  };

  const calculateMinMaxReward = (blocks) => {
    let minReward = Math.min(
      ...blocks.map((block) => parseFloat(block.rewardBTC))
    );
    let maxReward = Math.max(
      ...blocks.map((block) => parseFloat(block.rewardBTC))
    );
    return { minReward, maxReward };
  };

  const calculateBlockSizeVariance = (blocks) => {
    let blockSizes = blocks.map((block) => block.size);
    let meanSize = blockSizes.reduce((a, b) => a + b, 0) / blockSizes.length;
    let variance =
      blockSizes.reduce((acc, size) => acc + Math.pow(size - meanSize, 2), 0) /
      blockSizes.length;
    return Math.sqrt(variance);
  };

  /*   const calculateTotalFees = (blocks) => {
    return 0; 
  }; */

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {},
      (err) => {
        console.error("Failed to copy text: ", err);
      }
    );
  };

  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        const response = await axios.get("http://localhost:5000/latest-blocks");
        setBlocks(response.data);
      } catch (err) {
        console.error("Error fetching blocks:", err);
        setError("Unable to fetch data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlocks();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#ffffff",
        }}
      >
        <CircularProgress />
      </div>
    );
  }
  if (error)
    return <p style={{ textAlign: "center", color: "red" }}>{error}</p>;

  const totalTransactions = calculateTotalTransactions(blocks);
  const averageTransactions = calculateAverageTransactionsPerBlock(blocks);
  const { averageBTC, averageUSD } = calculateAverageReward(blocks);
  const averageBlockSize = calculateAverageBlockSize(blocks);
  const averageTimeBetweenBlocks = calculateAverageTimeBetweenBlocks(blocks);
  const { minReward, maxReward } = calculateMinMaxReward(blocks);
  const blockSizeVariance = calculateBlockSizeVariance(blocks);
  //const totalFees = calculateTotalFees(blocks);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ marginLeft: "20px" }}>
        <h1
          style={{
            textAlign: "center",
            fontFamily: "Poppins, sans-serif",
            fontSize: "30px",
            color: "#3f51b5",
            textTransform: "uppercase",
            letterSpacing: "2px",
            textShadow: "2px 2px 5px rgba(0, 0, 0, 0.2)",
            transition: "all 0.3s ease",
          }}
        >
          Latest Blocks
        </h1>
      </div>

      {/* Button to toggle summary */}
      <div
        style={{
          marginTop: "20px",
          marginRight: "200px",
          marginBottom: "30px",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
                <Button
          variant="contained"
          color="primary"
          style={{
            marginTop: "10px",
          }}
          onClick={() => setShowSummary(!showSummary)}
        >
          {showSummary ? "Hide Statistics" : "Show Statistics"}
        </Button>
      </div>
      {/* Show SummaryBlocks component if showSummary is true */}
      {showSummary && (
        <LatestBlocksStatistic
          totalTransactions={totalTransactions}
          averageTransactions={averageTransactions}
          averageBlockSize={averageBlockSize}
          averageTimeBetweenBlocks={averageTimeBetweenBlocks}
          minReward={minReward}
          maxReward={maxReward}
          blockSizeVariance={blockSizeVariance}
          //totalFees={totalFees}
        />
      )}

      <table
        style={{
          width: "80%",
          marginLeft: "auto",
          marginRight: "auto",
          borderCollapse: "collapse",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: "#f5f5f5",
              borderBottom: "2px solid #ddd",
            }}
          >
            <th style={styles.headerCell}>Hash</th>
            <th style={styles.headerCell}>Height</th>
            <th style={styles.headerCell}>Size (Bytes)</th>
            <th style={styles.headerCell}>Transactions</th>
            <th style={styles.headerCell}>Reward (BTC)</th>
            <th style={styles.headerCell}>Reward (USD)</th>
            <th style={styles.headerCell}>Mined Time</th>
          </tr>
        </thead>
        <tbody>
          {blocks.map((block) => (
            <tr key={block.hash} style={{ borderBottom: "1px solid #ddd" }}>
              <td style={styles.bodyCell}>
                <Link
                  to={`/block-hash/${block.hash}`}
                  style={{ textDecoration: "none", color: "#333" }}
                >
                  {block.hash}
                </Link>
                <IconButton
                  style={{ marginLeft: "10px", color: "#0288d1" }}
                  onClick={() => copyToClipboard(block.hash)}
                >
                  <ContentCopyIcon />
                </IconButton>
              </td>
              <td style={styles.bodyCell}>
                {block.height}{" "}
                <IconButton
                  style={{ marginLeft: "10px", color: "#0288d1" }}
                  onClick={() => copyToClipboard(block.height)}
                >
                  <ContentCopyIcon />
                </IconButton>
              </td>
              <td style={styles.bodyCell}>{block.size.toLocaleString()}</td>
              <td style={styles.bodyCell}>{block.transactions}</td>
              <td style={styles.bodyCell}>{block.rewardBTC}</td>
              <td style={styles.bodyCell}>${block.rewardUSD}</td>
              <td style={styles.bodyCell}>{block.minedDateTime}</td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
};

const styles = {
  title: {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 500,
    fontSize: "3.5rem",
    background: "linear-gradient(45deg, rgb(0, 68, 255), #ff8f00)",
    color: "transparent",
    WebkitBackgroundClip: "text",
    fontWeight: "bold",
    textShadow: "3px 3px 10px rgba(0, 0, 0, 0.3)",
    letterSpacing: "2px",
    padding: "20px",
    background: "linear-gradient(45deg,rgb(0, 68, 255), #ff8f00)",
    backgroundClip: "text",
    transition: "transform 0.3s ease, color 0.3s ease",
  },
  headerCell: {
    padding: "12px",
    textAlign: "left",
    fontWeight: "bold",
    fontSize: "16px",
    color: "#333",
  },
  bodyCell: {
    padding: "12px",
    fontSize: "14px",
    color: "#555",
    wordWrap: "break-word",
  },

  infoBoxStyle: {
    flex: "1 1 calc(33% - 20px)",
    minWidth: "200px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    padding: "15px",
    boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    cursor: "default",
  },

  ":hover": {
    transform: "scale(1.05)",
    boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.2)",
  },
};

export default LatestBlocks;
