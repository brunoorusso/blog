const express = require("express");
const router = express.Router();
const pool = require("../db");

// Selecionar todos os autores
router.get("/all", async (req, res) => {
  try {
    pool.query("SELECT * FROM author", (err, result) => {
      if (err) {
        console.error("Error", err);
        res.status(500).json({ error: "Error finding authors" });
      } else {
        console.log("Authors: ", result.rows);
        res.status(200).json(result.rows);
      }
    });
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ err: "Internal server error" });
  }
});

// Criar novo autor
router.post("/new", async (req, res) => {
  const { username, name, description } = req.body;
  
  try {
    const { rows } = await pool.query(
      `SELECT * FROM author WHERE username = $1`,
      [username]
    );

    if (rows.length > 0) {
      return res.status(400).json({
        error: "Username already in use",
      });
    }

    const result = await pool.query(
      `INSERT INTO author(username, name, description) VALUES($1, $2, $3) RETURNING *`,
      [username, name, description]
    );

    console.log("Created author: ", result.rows);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ error: "Error creating author" });
  }
});


module.exports = router;
