"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const dotenv_1 = tslib_1.__importDefault(require("dotenv"));
dotenv_1.default.config();
const cors_1 = tslib_1.__importDefault(require("cors"));
const express_1 = tslib_1.__importDefault(require("express"));
const middleware_1 = require("./middleware");
const routes_1 = require("./routes");
const connection_1 = tslib_1.__importDefault(require("./database/connection"));
// Create express app
const app = (0, express_1.default)();
// Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(middleware_1.errorHandler);
// Routes
app.use('/notifications', routes_1.notifications);
app.use('/navigation', routes_1.navigation);
app.use('/oauth', routes_1.oauth);
app.use('/favorites', routes_1.favorites);
app.use('/family', routes_1.family);
const startServer = () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    console.log(`[SERVER] Starting`);
    const PORT = process.env.PORT || 4000;
    try {
        // Await database connection
        yield (0, connection_1.default)();
        console.log(`[SERVER] Database Connected`);
        // Start the server after successful database connection
        const server = app.listen(PORT, () => {
            console.log(`[SERVER] Running on`, `http://localhost:${PORT}`);
        });
        /* Handle unhandled promise rejections */
        process.on('unhandledRejection', (err) => {
            if (err instanceof Error) {
                console.log(`[ERROR] Unhandled Rejection: ${err.message}`);
            }
            // Close server & exit process
            server.close(() => process.exit(1));
        });
    }
    catch (error) {
        console.log(`[DATABASE] Connection failed: ${error.message}`);
        process.exit(1);
    }
});
startServer();
