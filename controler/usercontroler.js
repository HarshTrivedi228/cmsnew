const usermodel = require('../models/user');
const newsmodel = require('../models/news');
const categorymodel = require('../models/category');
const authwannamodel = require('../models/authwanna');
const Setting = require('../models/setting');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const expressValidator = require('express-validator');
dotenv.config();
const fs=require('fs');
const loginPage = async (req, res, next) => {
  try {
    res.render('admin/login', { layout: false,
      errors: []
     });
  } catch (error) {
    next(error);
  }
};

const adminLogin = async (req, res, next) => {
    const errors = expressValidator.validationResult(req);
    if (!errors.isEmpty()) {
    return res.render('admin/login', { 
        layout: false,
        errors: errors.array() });
    }
  try {
    const { username, password } = req.body;
    const user = await usermodel.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Migration-safe password check:
    // - If the stored password looks like a bcrypt hash, use bcrypt.compare
    // - Otherwise assume legacy plaintext, compare directly and re-hash on success
    let isPasswordValid = false;
    const stored = user.password || '';
    const isHashed = typeof stored === 'string' && /^\$2[aby]\$/.test(stored);
    if (isHashed) {
      isPasswordValid = await bcrypt.compare(password, stored);
    } else {
      if (password === stored) {
        isPasswordValid = true;
        // Attempt to migrate plaintext password to a hash
        try {
          user.password = await bcrypt.hash(password, 10);
          await user.save();
        } catch (e) {
          console.error('Failed to migrate plaintext password to hash', e);
        }
      }
    }

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }
    const jwtData = {
      id: user._id,
      username: user.username,
      role: user.role
    };
    const token = jwt.sign(jwtData, process.env.JWT_SECRET, { expiresIn: '10h' });
    res.cookie('token', token, { httpOnly: true, maxAge: 1000 * 60 * 60 * 10 });
    res.redirect('/admin/dashboard');
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    res.clearCookie('token');
    res.redirect('/admin/');
  } catch (error) {
    next(error);
  }
};

const dashboard = async (req, res, next) => {
  try {
    let articleCount;
    if (req.role !== 'admin') {
      articleCount = await newsmodel.countDocuments({ author: req.id });
    } else {
      articleCount = await newsmodel.countDocuments();
    }

    const userCount = await usermodel.countDocuments();
    const categoryCount = await categorymodel.countDocuments();
    const settings = await Setting.findOne();
    res.render('admin/dashboard', {
      articleCount,
      userCount,
      categoryCount,
      role: req.role,
      fullname: req.fullname,
      settings
    });
  } catch (error) {
    next(error);
  }
};

const settings = async (req, res, next) => {
  try {
    const settings = await Setting.findOne();
    res.render('admin/setting', { role: req.role, settings });
  } catch (error) {
    next(error);
  }
};

const saveSettings = async (req, res, next) => {
  const { website_title, footer_description } = req.body;
  const website_logo = req.file ? req.file.filename : undefined;

  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting();
    }
    settings.website_title = website_title || settings.website_title;
    settings.website_logo = website_logo || settings.website_logo;
    settings.footer_description = footer_description || settings.footer_description;
      if(website_logo){
        if(settings.website_logo){
          const logoPath = `./uploads/${settings.website_logo}`;
          if (fs.existsSync(logoPath)) {
            fs.unlinkSync(logoPath);
          }
        }
      } 
      settings.website_logo = website_logo;
    await settings.save();
    res.redirect('/admin/setting');
  } catch (error) {
    next(error);
  }
};

const allUsers = async (req, res, next) => {
  try {
    const users = await usermodel.find();
    res.render('admin/users', { users, role: req.role });
  } catch (error) {
    next(error);
  }
};


// const addrequestpage=async(req,res,next)=>{
//   try {
//     const user = await authwannamodel.findById(req.params.id);
//     console.log('user')
//     console.log(user);
//     res.render('admin/showrequest', { user, role: req.role });
//   } catch (error) {
//     res.json({ message: 'User not found' });
//   }
// }


const nodemailer = require('nodemailer');


const addrequestpage = async (req, res, next) => {
  try {
    const user = await authwannamodel.findById(req.params.id);

    if (!user) {
      return res.json({ message: 'User not found' });
    }

   

    // ========== Email setup ==========
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'h30612453@gmail.com',
        pass: 'myvmznoohznizpzo',
      },
    });

    const mailOptions = {
      from: '"Harsh Trivedi 👨‍💻" <h30612453@gmail.com>',
      to: user.email,
      subject: '🎉 Congratulations! You are Approved 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; border-radius: 10px;">
          <h2 style="color: #4CAF50;">Welcome, ${user.fullname}!</h2>
          <p>Your request has been <strong style="color: green;">approved</strong> successfully.</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><em>For security reasons your password is not included in this email.</em></p>
          <p>You can now login and start posting as an author!</p>
          <br>
          <p style="color: #888;">Regards,<br><strong>Admin Team</strong></p>
        </div>
      `,
    };

    // ========= Send Email =========
    await transporter.sendMail(mailOptions)
      .then(info => {
        console.log('✅ Email sent:', info.response);
      })
      .catch(err => {
        console.error('❌ Error sending email:', err);
      });
    
    // ========== Render Page ==========
     await authwannamodel.findByIdAndDelete(req.params.id);
    res.render('admin/showrequest', { user, role: req.role });

  } catch (error) {
    console.error('❌ Error in addrequestpage:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};




const addUserPage = async (req, res, next) => {
  try {
    res.render('admin/users/create', { role: req.role });
  } catch (error) {
    next(error);
  }
};

const addUser = async (req, res, next) => {
  try {
    // Hash password before creating user to ensure it's never stored in plaintext
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }
    await usermodel.create(req.body);
    res.redirect('/admin/users');
  } catch (error) {
    next(error);
  }
};

const updateUserPage = async (req, res, next) => {
  const id = req.params.id;
  try {
    const user = await usermodel.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.render('admin/users/update', { user, role: req.role });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  const { fullname, username, password, role } = req.body;
  const id = req.params.id;
  try {
    const user = await usermodel.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.fullname = fullname || user.fullname;
    user.username = username;
      if (password) {
        // Hash updated password before saving
        user.password = await bcrypt.hash(password, 10);
      }
    user.role = role || user.role;

    await user.save();
    res.redirect('/admin/users');
  } catch (error) {
    next(error);
  }
};


const authwannapage = async (req, res, next) => {
   res.render('admin/authwanna',{layout: false});
}

const authwanna = async (req, res, next) => {
  try {
    const auth = new authwannamodel(req.body);
    await auth.save();
    res.render('admin/showauthwanna', { layout: false });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
 const allRequests=async(req,res,next)=>{
  try {
    const requests = await authwannamodel.find();

    res.render('admin/requests', { requests, role: req.role });
  } catch (error) {
    next(error);
  }
 }
const deleteRequest = async (req, res, next) => {
  const id = req.params.id;
  try {
    const request = await authwannamodel.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    await request.deleteOne();
    res.redirect('/admin/requests');
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  const id = req.params.id;
  try {
    const user = await usermodel.findById(id);
    if (!user) {
      return res.redirect('/admin/userHasCreated')
    }
    const articles = await newsmodel.find({ author: id });
    if (articles.length > 0) {
      return res.render('admin/users/deleteerror', {
        message: 'Sorry! You cannot delete this user. Articles are linked with it.',
      })
    }

    await user.deleteOne();
    res.redirect('/admin/users');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loginPage,
  adminLogin,
  logout,
  allUsers,
  addUserPage,
  addUser,
  updateUserPage,
  updateUser,
  deleteUser,
  dashboard,
  settings,
  saveSettings,
  authwannapage,
  authwanna,
  allRequests,
  deleteRequest,
  addrequestpage
};
