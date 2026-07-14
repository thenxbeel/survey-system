const jwt = require("jsonwebtoken");
const SECRET = "adntc-cx-platform-dev-secret-change-in-production";
const token = jwt.sign({ employeeId: "EMP001", id: 1, role: "System Administrator" }, SECRET, { expiresIn: "7d" });
console.log(token);
