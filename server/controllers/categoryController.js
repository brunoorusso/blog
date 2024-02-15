const express = require("express");
const router = express.Router();
const pool = require("../db");

/**
 * @swagger
 * /categories/all:
 *   get:
 *     summary: Return all categories.
 *     responses:
 *       200:
 *         description: Success obtaining categories.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *       404:
 *         description: Category not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *     tags:
 *       - Categories
 */
router.get("/all", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM category");

    if (rows.length === 0) {
      res.status(404).json({ error: "Categories not found" });
    } else {
      console.log("Categories", rows);
      res.status(200).json(rows);
    }
  } catch (err) {
    console.error("Internal server error", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/new", async (req, res) => {
    const { name, parent_category_id } = req.body;

    try{
        const result = await pool.query(`INSERT INTO category(name, parent_category_id) VALUES($1, $2) RETURNING *`,
        [name, parent_category_id]);

        console.log("Category created: ", result.rows);
        res.status(200).json(result.rows);
    } catch(err){
        console.error("Error", err);
        res.status(500).json({ error: "Error creating category" });
    }
});

router.put("/update/:id", async (req, res) => {
    const { id } = req.params;
    const { name, parent_category_id } = req.body;

    try{
        const { rows } = await pool.query(`SELECT * FROM category WHERE id = $1`, [id]);
        
        if(rows.length === 0){
            return res.status(404).json({
                error: "Category not found",
            });
        }

        const result = await pool.query(
            `UPDATE category SET name = $1, parent_category_id = $2 WHERE id = $3`,
            [name, parent_category_id, id]
        );
        res.status(200).json({ message: "Category updated successfully!" });
    } catch (err) {
        console.error("Error", err);
        res.status(500).json({ error: "INTERNAL SERVER ERROR" });
      }
})

router.delete("/delete/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(`DELETE FROM category WHERE id = $1`, [id]);
        if(result.rowCount > 0){
            res.status(200).json({ message: "Category deleted" });
        } else {
      res.status(404).json({ error: "Category not found" });
    }
    } catch (err) {
        console.error("Error while deleting category", err);
        res.status(500).json({ error: "Internal Server Error" });
      }
})

module.exports = router;