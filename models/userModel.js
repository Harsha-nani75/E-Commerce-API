// models/userModel.js
const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
  create: async ({ name, email, password }) => {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );
    return { id: result.insertId, name, email };
  },

  findByEmail: async (email) => {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0]; // return single user or undefined
  },

  findById: async (id) => {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return rows[0]; // return single user or undefined
  }
};

module.exports = User;
