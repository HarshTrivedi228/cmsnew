// middleware/isLoggedIn.js
const jwt = require('jsonwebtoken');

const isLoggedIn = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect('/admin/');
  }

  try {
    const tokendata = jwt.verify(token, process.env.JWT_SECRET);
    
   
    req.role = tokendata.role;
    req.fullname = tokendata.username;
    req.id=tokendata.id

    // ✅ Make role and fullname available to EJS
    res.locals.role = tokendata.role;
    res.locals.fullname = tokendata.username;

    next();
  } catch (e) {
    res.status(400).json({ message: 'Token is not valid' });
  }
};

module.exports = isLoggedIn;
