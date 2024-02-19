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

router.post("/new", async (req, res) => {
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

module.exports = router;