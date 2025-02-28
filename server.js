const express = require("express");
const cors = require("cors");
const { Pool } = require("pg"); // Import pg package
const { v4: uuidv4 } = require('uuid');  // Import uuidv4

const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());
app.use(cors({
   origin: "https://mini-offer-server-frontend.vercel.app", // Allow frontend domain
   methods: "GET,POST,PATCH,DELETE",
   allowedHeaders: "Content-Type,Authorization"
}));


// ✅ Set up PostgreSQL Connection Pool
const pool = new Pool({
   connectionString: "postgresql://admin:uYOQ7Ts10ECAR6SP7ouAY5yX0y0lfTN7@dpg-cv0a8d0gph6c73c9en50-a.oregon-postgres.render.com/mini_offer_db", // Replace with your actual database URL
   ssl: {
      rejectUnauthorized: false
   }
});

// ✅ Home Route
app.get("/", (req, res) => {
   res.send("Mini Offer API is running!");
});

// ✅ GET /offers - Fetch all offers from PostgreSQL
app.get("/offers", async (req, res) => {
   try {
      const result = await pool.query("SELECT * FROM offers");
      res.json(result.rows);
   } catch (error) {
      console.error("Error fetching offers:", error);
      res.status(500).send("Error fetching offers");
   }
});

// ✅ POST /offers - Add a new offer
app.post("/offers", async (req, res) => {
   const { brand, offer } = req.body;
   const id = uuidv4(); // Generate a unique ID for the offer

   try {
      const result = await pool.query(
         "INSERT INTO offers (id, brand, offer) VALUES ($1, $2, $3) RETURNING *",
         [id, brand, offer]
      );
      res.json({ message: "Offer added!", newOffer: result.rows[0] });
   } catch (error) {
      console.error("Error adding offer:", error);
      res.status(500).send("Error adding offer");
   }
});

// ✅ DELETE /offers/:id - Delete an offer
app.delete("/offers/:id", async (req, res) => {
   const { id } = req.params;

   try {
      const result = await pool.query("DELETE FROM offers WHERE id = $1 RETURNING *", [id]);
      if (result.rowCount === 0) {
         return res.status(404).json({ error: "Offer not found" });
      }
      res.json({ message: "Offer deleted!" });
   } catch (error) {
      console.error("Error deleting offer:", error);
      res.status(500).send("Error deleting offer");
   }
});

// ✅ PATCH /offers/:id - Update an offer
app.patch("/offers/:id", async (req, res) => {
   const { id } = req.params;
   const { brand, offer } = req.body;

   try {
      const result = await pool.query(
         "UPDATE offers SET brand = $1, offer = $2 WHERE id = $3 RETURNING *",
         [brand, offer, id]
      );
      if (result.rowCount === 0) {
         return res.status(404).json({ error: "Offer not found" });
      }
      res.json({ message: "Offer updated!", updatedOffer: result.rows[0] });
   } catch (error) {
      console.error("Error updating offer:", error);
      res.status(500).send("Error updating offer");
   }
});

// ✅ Start the Server
app.listen(PORT, () => {
   console.log(`✅ Server is running on http://localhost:${PORT}`);
});
