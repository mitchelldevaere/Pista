// src/utils/requireFields.js
// Returns the list of missing field names from req.body, or an empty array if all present.
module.exports = (body, fields) => fields.filter((field) => body[field] === undefined || body[field] === null || body[field] === "");
