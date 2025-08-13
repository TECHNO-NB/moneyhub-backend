"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const port = process.env.PORT || 8000;
app_1.app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
