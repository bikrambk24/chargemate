const jwt = require('jsonwebtoken'); 
const User = require('../models/User.model'); 
 
// Helper: generate JWT valid for 7 days 
const generateToken = (id) => { 
 return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' }); 
}; 
 
// POST /api/auth/register 
const register = async (req, res, next) => { 
 try { 
   const { name, email, password, role } = req.body; 
 
   const existingUser = await User.findOne({ email }); 
   if (existingUser) { 
     return res.status(400).json({ message: 'Email already registered' }); 
   } 
 
   const user = await User.create({ name, email, password, role }); 
   const token = generateToken(user._id); 
 
   res.status(201).json({ 
     message: 'User registered successfully', 
     token, 
     user: { 
       id: user._id, 
       name: user.name, 
       email: user.email, 
       role: user.role 
     } 
   }); 
 } catch (err) { 
   next(err); 
 } 
}; 
 
// POST /api/auth/login 
const login = async (req, res, next) => { 
 try { 
   const { email, password } = req.body; 
 
   const user = await User.findOne({ email }); 
   if (!user || !(await user.comparePassword(password))) { 
     return res.status(401).json({ message: 'Invalid email or password' }); 
   } 
 
   const token = generateToken(user._id); 
   res.json({ 
     message: 'Login successful', 
     token, 
     user: { 
       id: user._id, 
       name: user.name, 
       email: user.email, 
       role: user.role 
     } 
   }); 
 } catch (err) { 
   next(err); 
 } 
}; 
 
// GET /api/auth/me – get current logged-in user 
const getMe = async (req, res) => { 
 res.json({ user: req.user }); 
}; 
 
module.exports = { register, login, getMe }; 
