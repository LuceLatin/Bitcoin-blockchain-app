import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  CircularProgress,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Container,
  Divider,
} from "@mui/material";
import LatestBlocks from "./LatestBlocks";
import { useNavigate } from "react-router-dom";

const BlockchainInfo = () => {
  const [bitcoinData, setBitcoinData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBitcoinData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/bitcoin-dashboard"
        );
        setBitcoinData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching Bitcoin data:", error);
      }
    };

    fetchBitcoinData();
  }, []);

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

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#ffffff",
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        minHeight: "100vh",
        padding: "40px 0",
      }}
    >
      <Container maxWidth="lg">
        {/* Search Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "40px",
          }}
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
            style={{
              marginLeft: "10px",
              height: "56px",
              padding: "0 30px",
            }}
          >
            Search
          </Button>
        </div>

        <Divider sx={{ marginBottom: "40px" }} />

        <Grid container spacing={4} justifyContent="center">
          {/* Difficulty */}
          <Grid item xs={12} sm={6} md={4}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  Difficulty
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: 600,
                    fontSize: "2.5rem",
                    color: "#3f51b5",
                    textAlign: "center",
                    textTransform: "uppercase",
                    letterSpacing: "2px",
                    textShadow: "2px 2px 5px rgba(0, 0, 0, 0.2)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      color: "#ff5722",
                      textShadow: "2px 2px 15px rgba(0, 0, 0, 0.4)",
                    },
                  }}
                >
                  {" "}
                  {bitcoinData.difficulty}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Block Height */}
          <Grid item xs={12} sm={6} md={4}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  Block Height
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: 600,
                    fontSize: "2.5rem",
                    color: "#3f51b5",
                    textAlign: "center",
                    textTransform: "uppercase",
                    letterSpacing: "2px",
                    textShadow: "2px 2px 5px rgba(0, 0, 0, 0.2)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      color: "#ff5722",
                      textShadow: "2px 2px 15px rgba(0, 0, 0, 0.4)",
                    },
                  }}
                >
                  {bitcoinData.blockHeight}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Latest Blocks */}
      </Container>
      <div style={{ marginTop: "40px" }}>
        <LatestBlocks />
      </div>
    </div>
  );
};

export default BlockchainInfo;
