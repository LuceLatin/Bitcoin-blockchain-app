import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Link } from "react-router-dom";

import {
  CircularProgress,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Box,
  Divider,
  IconButton,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import { blue } from "@mui/material/colors";

const BlockHeight = () => {
  const { height } = useParams();
  const [block, setBlock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionsPerPage] = useState(10);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("");

  useEffect(() => {
    const fetchBlock = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/block-height/${height}`
        );
        setBlock(response.data);
      } catch (err) {
        setError("Block not found.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlock();
  }, [height]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {},
      (err) => {
        console.error("Failed to copy text: ", err);
      }
    );
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

  // Funkcija za sortiranje svih transakcija
  const sortTransactions = (transactions, option) => {
    if (option === "feeAsc") {
      return transactions.sort((a, b) => (a.fee || 0) - (b.fee || 0));
    } else if (option === "feeDesc") {
      return transactions.sort((a, b) => (b.fee || 0) - (a.fee || 0));
    }
    return transactions;
  };

  const handleSortChange = (event) => {
    setSortOption(event.target.value);
  };

  // Paginacija - Prvo sortiraj sve transakcije, pa podijeli na stranice
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const sortedTransactions = block
    ? sortTransactions(block.tx, sortOption)
    : [];
  const currentTransactions = sortedTransactions.slice(
    indexOfFirstTransaction,
    indexOfLastTransaction
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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

  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "40px",
          marginTop: "40px",
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

      <Box
        sx={{
          padding: 4,
          maxWidth: 1500,
          width: "100%",
          margin: "0 auto",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
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
          Block Details
        </Typography>
        <Divider sx={{ marginBottom: 2 }} />

        {block && (
          <>
            <Typography variant="h6" marginBottom={"10px"} fontSize={"25px"}>
              General Information
            </Typography><br/>
            <TableContainer component={Paper} sx={{ marginBottom: 4 }}>
              <Table>
                <TableBody>
                  <TableRow variant="body1">
                    <TableCell>
                      <Typography variant="body1" fontWeight="bold">
                        Hash:
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography>
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

                       </Typography>
                    </TableCell>
                  </TableRow>

                  <TableRow variant="body1">
                    <TableCell>
                      <Typography variant="body1" fontWeight="bold">
                        Confirmations:
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1">
                        {block.confirmations}
                      </Typography>
                    </TableCell>
                  </TableRow>

                  <TableRow variant="body1">
                    <TableCell>
                      <Typography variant="body1" fontWeight="bold">
                        Height:
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1">
                        <Link
                          to={`/block-height/${block.height}`}
                          style={{ textDecoration: "none", color: "#333" }}
                        >
                          {block.height}
                        </Link>
                        <IconButton
                          style={{ marginLeft: "10px", color: "#0288d1" }}
                          onClick={() => copyToClipboard(block.height)}
                        >
                          {" "}
                          <ContentCopyIcon />
                        </IconButton>
                      </Typography>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>
                      <Typography variant="body1" fontWeight="bold">
                        Previous Block Hash:
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1">
                        <Link
                          to={`/block-hash/${block.previousblockhash}`}
                          style={{ textDecoration: "none", color: "#333" }}
                        >
                          {block.previousblockhash}
                        </Link>
                        <IconButton
                          style={{ marginLeft: "10px", color: "#0288d1" }}
                          onClick={() =>
                            copyToClipboard(block.previousblockhash)
                          }
                        >
                          <ContentCopyIcon />
                        </IconButton>
                      </Typography>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>
                      <Typography variant="body1" fontWeight="bold">
                        Next Block Hash:
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1">
                        {block.nextblockhash
                          ? block.nextblockhash
                          : "No next block"}
                      </Typography>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>
                      <Typography variant="body1" fontWeight="bold">
                        Size (bytes):
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1">{block.size}</Typography>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>
                      <Typography variant="body1" fontWeight="bold">
                        Merkle Root:
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1">
                        {block.merkleroot}
                      </Typography>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>
                      <Typography variant="body1" fontWeight="bold">
                        Time:
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1">
                        {new Date(block.time * 1000).toLocaleString()}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="h6" marginBottom={"10px"} fontSize={"25px"}>
              Transactions ({block.tx.length})
            </Typography>

            {/* Sort Dropdown */}
            <FormControl
              sx={{
                minWidth: 120,
                marginBottom: 2,
                marginLeft: "auto",
                marginRight: 0,
              }}
            >
              <InputLabel>Sort by Fee</InputLabel>
              <Select
                value={sortOption}
                label="Sort by Fee"
                onChange={handleSortChange}
              >
                <MenuItem value="feeAsc">Fee: Low to High</MenuItem>
                <MenuItem value="feeDesc">Fee: High to Low</MenuItem>
              </Select>
            </FormControl>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>TXID</TableCell>
                    <TableCell>Size (bytes)</TableCell>
                    <TableCell>Weight</TableCell>
                    <TableCell>Version</TableCell>
                    <TableCell>Locktime</TableCell>
                    <TableCell>Fee</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentTransactions.map((transaction, index) => (
                    <TableRow key={index}>
                      <TableCell style={styles.bodyCell}>
                        <Link
                          to={`/transaction/${transaction.txid}`}
                          style={{ textDecoration: "none", color: "#333" }}
                        >
                          {transaction.txid}
                        </Link>
                        <IconButton
                          style={{ marginLeft: "10px", color: "#0288d1" }}
                          onClick={() => copyToClipboard(transaction.txid)}
                        >
                          <ContentCopyIcon />
                        </IconButton>
                      </TableCell>
                      <TableCell>{transaction.size}</TableCell>
                      <TableCell>{transaction.weight}</TableCell>
                      <TableCell>{transaction.version}</TableCell>
                      <TableCell>{transaction.locktime}</TableCell>
                      <TableCell>
                        {transaction.fee ? transaction.fee : "0"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination Controls */}
            <Box
              display="flex"
              justifyContent="center"
              marginBottom="30px"
              marginTop="30px"
              color="blue"
              mt={2}
            >
              <Button
                variant="outlined"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                style={{ marginRight: "10px" }}
              >
                Previous
              </Button>
              <Button
                variant="outlined"
                onClick={() => paginate(currentPage + 1)}
                disabled={indexOfLastTransaction >= block.tx.length}
              >
                Next
              </Button>
            </Box>
          </>
        )}
      </Box>
    </div>
  );
};

const styles = {
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
};

export default BlockHeight;
