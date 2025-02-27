const express = require("express");
const cors = require("cors");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

// ✅ Function to Read Offers
const getOffers = () => {
   try {
      const data = fs.readFileSync("db.json", "utf8");
      return JSON.parse(data).offers || [];
   } catch (error) {
      console.error("Error reading db.json:", error);
      return [];
   }
};

// ✅ Ensure db.json exists
if (!fs.existsSync("db.json")) {
   fs.writeFileSync("db.json", JSON.stringify({ offers: [] }, null, 2));
}

// ✅ Home Route
app.get("/", (req, res) => {
   res.send("Mini Offer API is running!");
});

// ✅ GET /offers - Fetch all offers
app.get("/offers", (req, res) => {
   res.json(getOffers());
});

// ✅ POST /offers - Add a new offer
app.post("/offers", (req, res) => {
   const offers = getOffers();

   const newOffer = {
      id: uuidv4(), // ✅ Generate a unique ID
      brand: req.body.brand,
      offer: req.body.offer
   };

   const updatedOffers = [...offers, newOffer];

   // ✅ Save back to db.json
   fs.writeFileSync("db.json", JSON.stringify({ offers: updatedOffers }, null, 2));

   res.json({ message: "Offer added!", newOffer });
});

// ✅ DELETE /offers/:id - Delete an offer
app.delete("/offers/:id", (req, res) => {
   const offers = getOffers();
   const offerId = req.params.id;

   const updatedOffers = offers.filter(offer => offer.id !== offerId);

   if (offers.length === updatedOffers.length) {
      return res.status(404).json({ error: "Offer not found" });
   }

   fs.writeFileSync("db.json", JSON.stringify({ offers: updatedOffers }, null, 2));

   res.json({ message: "Offer deleted!" });
});

// ✅ PATCH /offers/:id - Update an offer
app.patch("/offers/:id", (req, res) => {
   const offers = getOffers();
   const offerId = req.params.id;

   const offerIndex = offers.findIndex(offer => offer.id === offerId);
   if (offerIndex === -1) {
      return res.status(404).json({ error: "Offer not found" });
   }

   offers[offerIndex] = { ...offers[offerIndex], ...req.body };

   fs.writeFileSync("db.json", JSON.stringify({ offers }, null, 2));

   res.json({ message: "Offer updated!", updatedOffer: offers[offerIndex] });
});

// ✅ Start the Server
app.listen(PORT, () => {
   console.log(`✅ Server is running on http://localhost:${PORT}`);
});
