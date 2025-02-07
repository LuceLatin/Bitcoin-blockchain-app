import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
  CircularProgress,
  Typography,
  TextField,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  Box,
  Link,
  Divider,
  IconButton,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import { useNavigate } from "react-router-dom";

const Transaction = () => {
  const { txid } = useParams();
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInputIndex, setSearchInputIndex] = useState(null);
  const [searchOutputIndex, setSearchOutputIndex] = useState(null);
  const [totalInputValue, settotalInputValue] = useState(null);
  const [totalOutputValue, setTotalOutputValue] = useState(null);
  const [minersFee, setMinersFee] = useState(null);

  const [inputIndexError, setInputIndexError] = useState("");
  const [outputIndexError, setOutputIndexError] = useState("");

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      try {
        setError(null);
        const response = await axios.get(
          `http://localhost:5000/transaction/${txid}`
        );
        setTransactionDetails(response.data);
        settotalInputValue(response.data.totalInputValue);
        setTotalOutputValue(response.data.totalOutputValue);
        setMinersFee(response.data.minerFee);
      } catch (err) {
        setError(
          "Error fetching transaction details. Please check the transaction ID and try again."
        );
        console.error(err.message);
      }
    };

    if (txid) {
      fetchTransactionDetails();
    }
  }, [txid]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {},
      (err) => {
        console.error("Failed to copy text: ", err);
      }
    );
  };

  const handleInputIndexChange = (e) => {
    const value = e.target.value;
    if (value.trim() === "") {
      setSearchInputIndex(null);
      setInputIndexError("");
      return;
    }

    const index = parseInt(value);

    if (
      isNaN(index) ||
      index < 0 ||
      index >= (transactionDetails?.vin?.length || 0)
    ) {
      setInputIndexError(
        `Please enter a number between 0 and ${
          transactionDetails?.vin?.length - 1
        }`
      );
    } else {
      setInputIndexError("");
      setSearchInputIndex(index);
    }
  };
  const handleOutputIndexChange = (e) => {
    const index = parseInt(e.target.value);
    setSearchOutputIndex(index);

    if (
      isNaN(index) ||
      index < 0 ||
      index >= (transactionDetails?.vout?.length || 0)
    ) {
      setOutputIndexError(
        `Please enter a number between 0 and ${
          transactionDetails?.vout?.length - 1
        }`
      );
    } else {
      setOutputIndexError("");
    }
  };

  const handleSearch = () => {
    const query = searchQuery.trim();

    if (!query) return;

    if (!isNaN(query)) {
      navigate(`/block-height/${query}`);
    } else if (query.length < 64) {
      navigate(`/block-height/${query}`);
    } else if (query.length === 64) {
      if (query.startsWith("0000")) {
        navigate(`/block-hash/${query}`);
      } else {
        navigate(`/transaction/${query}`);
      }
    } else {
      navigate(`/transaction/${query}`);
    }
  };

  const filteredInputs =
    searchInputIndex !== null
      ? [transactionDetails.vin[searchInputIndex]]
      : transactionDetails?.vin;

  const filteredOutputs =
    searchOutputIndex !== null
      ? [transactionDetails.vout[searchOutputIndex]]
      : transactionDetails?.vout;

  return (
    <Container>
      {/* Search Bar */}
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        marginY={4}
      >
        <TextField
          label="Search by Block Hash, Height, or Transaction ID"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          fullWidth
          style={{ maxWidth: "600px" }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSearch}
          style={{ marginLeft: "10px", height: "56px", padding: "0 30px" }}
        >
          Search
        </Button>
      </Box>

      <Typography variant="h4" align="center" gutterBottom>
        Transaction Details
      </Typography>

      {/* Transaction Details */}
      {transactionDetails ? (
        <Box marginY={4}>
          {/* General Info */}
          <Box marginY={4}>
            {/* General Info */}
            <Card
              style={{
                border: "1px solid #e0e0e0",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                borderRadius: "10px",
              }}
            >
              <CardContent style={{ padding: "20px 30px" }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  style={{
                    marginBottom: "20px",
                    fontSize: "26px",
                    fontWeight: "bold",
                    color: "#0288d1",
                    textAlign: "center",
                  }}
                >
                  General Information
                </Typography>
                <Divider
                  style={{
                    borderTop: "3px solid #0288d1",
                    margin: "20px 0",
                  }}
                />

                <Box style={{ marginTop: "10px", lineHeight: "1.8" }}>
                  <Typography variant="body1" style={{ marginBottom: "10px" }}>
                    <strong style={{ color: "#424242" }}>
                      Transaction ID:
                    </strong>{" "}
                    <span style={{ color: "#757575" }}>
                      {transactionDetails.txid}
                    </span>
                  </Typography>
                  <Typography variant="body1" style={{ marginBottom: "10px" }}>
                    <strong style={{ color: "#424242" }}>Block Hash:</strong>{" "}
                    <Link
                      to={`/block-hash/${transactionDetails.blockhash}`}
                      style={{ textDecoration: "none", color: "#757575" }}
                    >
                      {transactionDetails.blockhash || "N/A"}
                    </Link>
                    <IconButton
                      style={{ marginLeft: "10px", color: "#0288d1" }}
                      onClick={() =>
                        copyToClipboard(transactionDetails.blockhash)
                      }
                    >
                      <ContentCopyIcon />
                    </IconButton>{" "}
                  </Typography>
                  <Typography variant="body1" style={{ marginBottom: "10px" }}>
                    <strong style={{ color: "#424242" }}>Confirmations:</strong>{" "}
                    <span style={{ color: "#757575" }}>
                      {transactionDetails.confirmations}
                    </span>
                  </Typography>
                  <Typography variant="body1" style={{ marginBottom: "10px" }}>
                    <strong style={{ color: "#424242" }}>Time:</strong>{" "}
                    <span style={{ color: "#757575" }}>
                      {new Date(
                        transactionDetails.time * 1000
                      ).toLocaleString()}
                    </span>
                  </Typography>
                  <Typography variant="body1" style={{ marginBottom: "10px" }}>
                    <strong style={{ color: "#424242" }}>Size (bytes):</strong>{" "}
                    <span style={{ color: "#757575" }}>
                      {transactionDetails.size || "N/A"}
                    </span>
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
          {/* Miners fee */}
          <Typography
            variant="body1"
            align="center"
            style={{
              marginTop: "20px",
              marginBottom: "16px",
              fontWeight: "bold",
            }}
          >
            Miner's fee: {minersFee} BTC
          </Typography>

          {/* Inputs & Outputs Side-by-Side */}
          <Grid container spacing={4} marginTop={4}>
            {/* Inputs */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Inputs ({transactionDetails.vin.length})
              </Typography>

              {/* Total Input Value */}
              <Typography
                variant="body1"
                align="right"
                style={{ marginBottom: "16px", fontWeight: "bold" }}
              >
                Total Input Value: {totalInputValue} BTC
              </Typography>

              {/* Input Search by Index */}
              <Box
                display="flex"
                justifyContent="space-between"
                marginBottom={2}
              >
                <TextField
                  label="Search by Input Index"
                  variant="outlined"
                  value={searchInputIndex !== null ? searchInputIndex : ""}
                  onChange={handleInputIndexChange}
                  fullWidth
                  style={{ maxWidth: "300px" }}
                />
              </Box>
              {inputIndexError && (
                <Typography color="error" variant="body2">
                  {inputIndexError}
                </Typography>
              )}

              {filteredInputs?.length > 0 ? (
                filteredInputs.map((input, index) => (
                  <Card key={index} style={{ marginBottom: "16px" }}>
                    <CardContent>
                      <Typography variant="body1">
                        <strong>
                          {searchInputIndex !== null ? searchInputIndex : index}
                        </strong>{" "}
                        - <strong>Address:</strong> {input.address || "N/A"}
                        {input.address !== "Coinbase" && (
                          <IconButton
                            style={{ marginLeft: "10px", color: "#0288d1" }}
                            onClick={() => copyToClipboard(input.address)}
                          >
                            <ContentCopyIcon />
                          </IconButton>
                        )}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Value:</strong>{" "}
                        {input.value !== undefined ? input.value : "N/A"} BTC
                      </Typography>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Typography>No inputs found.</Typography>
              )}
            </Grid>

            {/* Outputs */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Outputs ({transactionDetails.vout.length})
              </Typography>

              {/* Total Output Value */}
              <Typography
                variant="body1"
                align="right"
                style={{ marginBottom: "16px", fontWeight: "bold" }}
              >
                Total Output Value: {totalOutputValue} BTC
              </Typography>

              {/* Output Search by Index */}
              <Box
                display="flex"
                justifyContent="space-between"
                marginBottom={2}
              >
                <TextField
                  label="Search by Output Index"
                  variant="outlined"
                  value={searchOutputIndex !== null ? searchOutputIndex : ""}
                  onChange={handleOutputIndexChange}
                  fullWidth
                  style={{ maxWidth: "300px" }}
                />
              </Box>
              {outputIndexError && (
                <Typography color="error" variant="body2">
                  {outputIndexError}
                </Typography>
              )}
              {filteredOutputs?.length > 0 ? (
                filteredOutputs.map((output, index) => (
                  <Card key={index} style={{ marginBottom: "16px" }}>
                    <CardContent>
                      <Typography variant="body1">
                        <strong>
                          {searchOutputIndex !== null
                            ? searchOutputIndex
                            : index}
                        </strong>{" "}
                        - <strong>Address:</strong> {output.address || "N/A"}
                        {output.address !==
                          "Address not available - op_return" && (
                          <IconButton
                            style={{ marginLeft: "10px", color: "#0288d1" }}
                            onClick={() => copyToClipboard(output.address)}
                          >
                            <ContentCopyIcon />
                          </IconButton>
                        )}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Value:</strong> {output.value} BTC
                      </Typography>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Typography>No outputs found.</Typography>
              )}
            </Grid>
          </Grid>
        </Box>
      ) : (
        // Loading State
        <Box display="flex" justifyContent="center" alignItems="center">
          <CircularProgress />
        </Box>
      )}
    </Container>
  );
};

export default Transaction;
