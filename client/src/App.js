import "./App.css";
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import BlockchainInfo from "./BlockchainInfo";
import BlockHash from "./BlockHash";
import BlockHeight from "./BlockHeight";
import Transaction from "./Transaction";
const App = () => {
  return (
    <div className="App">
      <header className="App-header">
        <Router>
          <nav className="navbar">
            <Link
              to="/"
              style={{
                ...styles.title,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
              }}
            >
              BlockExplorer
            </Link>
          </nav>
          <Routes>
            <Route path="/" element={<BlockchainInfo />} />

            <Route path="/block-hash/:hash" element={<BlockHash />} />
            <Route path="/block-height/:height" element={<BlockHeight />} />
            <Route path="/transaction/:txid" element={<Transaction />} />
          </Routes>
        </Router>
      </header>
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
};

export default App;
