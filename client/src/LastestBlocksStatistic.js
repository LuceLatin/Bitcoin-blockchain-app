import React from "react";
import { Typography } from "@mui/material";

const LatestBlocksStatistic = ({
  totalTransactions,
  averageTransactions,
  averageBlockSize,
  averageTimeBetweenBlocks,
  minReward,
  maxReward,
  blockSizeVariance,
  totalFees,
}) => {
  return (
    <div
      style={{
        marginTop: "30px",
        padding: "20px",
        maxWidth: "900px",
        marginLeft: "auto",
        marginRight: "auto",
        borderRadius: "10px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        marginBottom: "50px",
      }}
    >
      <Typography
        variant="h5"
        style={{
          marginBottom: "20px",
          fontWeight: "bold",
          color: "#3f51b5",
          borderBottom: "2px solid #0288d1",
          paddingBottom: "10px",
          textAlign: "center",
        }}
      >
        Summary of latest blocks
      </Typography>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          justifyContent: "center",
        }}
      >
        <div style={styles.infoBoxStyle}>
          <Typography variant="h6">Total Transactions</Typography>
          <Typography variant="body1">
            {totalTransactions.toLocaleString()}
          </Typography>
        </div>
        <div style={styles.infoBoxStyle}>
          <Typography variant="h6">Average Transactions per Block</Typography>
          <Typography variant="body1">
            {averageTransactions.toFixed(2)}
          </Typography>
        </div>
        <div style={styles.infoBoxStyle}>
          <Typography variant="h6">Average Block Size (Bytes)</Typography>
          <Typography variant="body1">{averageBlockSize.toFixed(2)}</Typography>
        </div>
        <div style={styles.infoBoxStyle}>
          <Typography variant="h6">Avg. Time Between Blocks</Typography>
          <Typography variant="body1">{averageTimeBetweenBlocks}</Typography>
        </div>
        <div style={styles.infoBoxStyle}>
          <Typography variant="h6">Min Block Reward (with fee) (BTC)</Typography>
          <Typography variant="body1">{minReward.toFixed(6)}</Typography>
        </div>
        <div style={styles.infoBoxStyle}>
          <Typography variant="h6">Max Block Reward (with fee)(BTC)</Typography>
          <Typography variant="body1">{maxReward.toFixed(6)}</Typography>
        </div>
        {/*         <div style={styles.infoBoxStyle}>
          <Typography variant="h6">Block Size Variance (Bytes)</Typography>
          <Typography variant="body1">{blockSizeVariance.toFixed(2)}</Typography>
        </div> */}
        {/*         <div style={styles.infoBoxStyle}>
          <Typography variant="h6">Total Fees</Typography>
          <Typography variant="body1">{totalFees}</Typography>
        </div> */}
      </div>
    </div>
  );
};

const styles = {
  infoBoxStyle: {
    flex: "1 1 calc(33% - 20px)",
    minWidth: "200px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    padding: "15px",
    boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    cursor: "pointer",
  },

  infoBoxHover: {
    transform: "scale(1.05)",
    boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.2)",
  },
};

export default LatestBlocksStatistic;
