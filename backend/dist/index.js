"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
app_1.app.listen(env_1.ENV.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${env_1.ENV.PORT}`);
    console.log(`Health check: http://localhost:${env_1.ENV.PORT}/health`);
});
//# sourceMappingURL=index.js.map