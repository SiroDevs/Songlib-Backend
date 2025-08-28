const express = require("express");
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');

if (process.env.NODE_ENV !== 'production') {
    require("dotenv").config({ path: "./.env" });
}

const swaggerDoc = JSON.parse(fs.readFileSync(path.join(__dirname, 'api', 'docs.json'), 'utf8'));
const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css"
const app = express();
app.use(cors());

app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    next();
});

// Connect to MongoDB Atlas
mongoose.connect(process.env.ATLAS_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    authSource: 'admin'
})
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err));

const home = require("./routes/app");
const apihome = require("./routes/app");

const book = require("./routes/book");
const books = require("./routes/books");
const drafts = require("./routes/drafts");
const edits = require("./routes/edits");
const listings = require("./routes/listings");
const orgs = require("./routes/orgs");
const song = require("./routes/song");
const songs = require("./routes/songs");
const users = require("./routes/users");

app.use(express.json({ limit: '50mb', extended: true }));

app.use("/", home);
app.use("/api", apihome);

app.use("/api/book", book);
app.use("/api/books", books);
app.use("/api/drafts", drafts);
app.use("/api/edits", edits);
app.use("/api/listings", listings);
app.use("/api/orgs", orgs);
app.use("/api/song", song);
app.use("/api/songs", songs);
app.use("/api/users", users);

//app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc, {
    customCss:
        '.swagger-ui .opblock .opblock-summary-path-description-wrapper { align-items: center; display: flex; flex-wrap: wrap; gap: 0 10px; padding: 0 10px; width: 100%; }',
    customCssUrl: CSS_URL,
}));

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`Songlib Server is running in port ${PORT}`));
