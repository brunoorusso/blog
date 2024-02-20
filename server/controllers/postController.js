const express = require("express");
const router = express.Router();
const pool = require("../db");
const { authenticateToken } = require('./authMiddleware');

router.get("/all", async (req, res) => {
    try{
        const { rows } = await pool.query(`SELECT * FROM post`);

        if(rows.length === 0){
            return res.status(404).json({ error: "Post not found"});
        } else {
            res.status(200).json(rows);
        }
    } catch (err){
        res.status(500).json({error: "Internal Server Error"});
    }
})

router.post("/new", authenticateToken, async (req, res) => {
    const {title, content, date, idAuthor, idCategory} = req.body;

    try{
        const postResult = await pool.query(
            `INSERT INTO post(title, content, date, idauthor) VALUES($1, $2, $3, $4) RETURNING *`,
            [title, content, date, idAuthor]
        );

        const postId = postResult.rows[0].id;
        
        for(const categoryId of idCategory){
            await pool.query(
                `INSERT INTO post_category (post_id, category_id) VALUES ($1, $2)`,
                [postId, categoryId]
            );
        }
        res.status(200).json({ error: "Post Created!" });
    } catch (err){
        res.status(500).json({ error: "Error creating post" });
    }
});

router.put("/update/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const {title, content, date, idAuthor, idCategory} = req.body;

    try{
        const { rows } = await pool.query(`SELECT * FROM post WHERE $1`, [id]);

        if(rows.length === 0){
            return res.status(400).json({
                error: "Post not found!"
            });
        }

        const result = await pool.query(
            `UPDATE post SET title = $1, content = $2, date = $3, idauthor = $4
             WHERE id = $5`,
            [title, content, date, idAuthor, id]);
        
        res.status(200).json({ message: "Post updated successfully!" });
    } catch (err){
        console.error("Error", err);
        res.status(500).json({ error: "INTERNAL SERVER ERROR" });
    }
})

router.delete("/delete/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    try{
        await pool.query(`DELETE FROM post_category WHERE post_id = $1`, [id])
        const result = await pool.query(`DELETE FROM post WHERE id = $1`, [id]);
        if (result.rowCount > 0) {
            res.status(200).json({ message: "Post deleted" });
          } else {
            res.status(404).json({ error: "Post not found" });
          }
    } catch (err) {
        console.error("Error while deleting post", err);
        res.status(500).json({ error: "Internal Server Error" });
      }
})

module.exports = router;