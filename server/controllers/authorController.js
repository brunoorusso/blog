const express = require("express");
const router = express.Router();
const pool = require("../db");

/**
 * @swagger
 * /authors/all:
 *   get:
 *     summary: Return all authors.
 *     responses:
 *       200:
 *         description: Success obtaining authors.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Author'
 *       404:
 *         description: Author not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *     tags:
 *       - Authors
 */
router.get("/all", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM author");

    if (rows.length === 0) {
      res.status(404).json({ error: "Authors not found" });
    } else {
      console.log("Authors", rows);
      res.status(200).json(rows);
    }
  } catch (err) {
    console.error("Internal server error", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @swagger
 * /authors/new:
 *   post:
 *     summary: Create new author.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success creating a new author.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Author'
 *       404:
 *         description: Error creating author.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *     tags:
 *       - Authors
 */
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

// Update author
router.put("/update/:id", async (req, res) => {
  const { id } = req.params;
  const { username, name, description } = req.body;

  try {
    const { rows } = await pool.query(`SELECT * FROM author WHERE id = $1`, [
      id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Author not found!",
      });
    }

    const result = await pool.query(
      `UPDATE author SET username = $1, name = $2, description = $3 WHERE id = $4`,
      [username, name, description, id]
    );
    res.status(200).json({ message: "Author updated successfully!" });
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ error: "INTERNAL SERVER ERROR" });
  }
});

// Delete author
router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`DELETE FROM author WHERE id = $1`, [id]);
    if (result.rowCount > 0) {
      res.status(200).json({ message: "Author deleted" });
    } else {
      res.status(404).json({ error: "Author not found" });
    }
  } catch (err) {
    console.error("Error while deleting author", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
