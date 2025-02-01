import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Admin from "../models/adminModel.js";

const router = express.Router();

//router for admin registration
router.post('/register', async (req,res) => {
    try {
        const adminCount = await Admin.countDocuments();
        if (adminCount >= 1) {
            return res.status(400).json({ msg: 'Admin registration limit reached' });
        }

        const { email, password } = req.body;
        const userExists = await Admin.findOne({email});
        if (userExists) {
            return res.status(400).json({msg:'User already exists'});
        }

        const hashedPassword = await bcrypt.hash(password, 12)

        const newUser = new Admin({
            email,
            password: hashedPassword
        });

        const savedUser = await newUser.save();

        const token = jwt.sign({id: savedUser._id}, process.env.JWT_ADMIN_SECRET, { expiresIn: '1h'});

        res.status(201).json({token,msg:'Admin registered succesfully'});

    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
})


//route for admin login
router.post('/login', async (req,res) => {
    try {

        const { email, password } = req.body;
        const admin = await Admin.findOne({email});
        if (!admin) {
            return res.status(400).json({msg:'Invalid credentials'});
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (isMatch) {
            const payload = {
                id: admin._id,
                email: admin.email
            };

            jwt.sign(
                payload,
                process.env.JWT_ADMIN_SECRET,
                { expiresIn: 18000 },
                (error, token) => {
                    if (error) throw error;
                    res.json({
                        token,
                        admin: {id:admin._id, email: admin.email}
                    });
                }
            );
        } else {
            return res.status(400).json({msg:'Invalid credentials'});
        }

    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});



//router for user registration
router.post('/userRegister', async (req,res) => {
    try {

        const { name ,email, password } = req.body;
        const userExists = await User.findOne({email});
        if (userExists) {
            return res.status(400).json({msg:'User already exists'});
        }

        const hashedPassword = await bcrypt.hash(password, 12)

        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });

        const savedUser = await newUser.save();

        const token = jwt.sign({id: savedUser._id}, process.env.JWT_USER_SECRET, { expiresIn: '1h'});

        res.status(201).json({token,msg:'User registered succesfully'});

    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
})


//route for user login
router.post('/userLogin', async (req,res) => {
    try {

        const { email, password } = req.body;
        const user = await User.findOne({email});
        if (!user) {
            return res.status(400).json({msg:'Invalid credentials'});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            const payload = {
                id: user._id,
                email: user.email
            };

            jwt.sign(
                payload,
                process.env.JWT_USER_SECRET,
                { expiresIn: 18000 },
                (error, token) => {
                    if (error) throw error;
                    res.json({
                        token,
                        user: {name:user.name, id:user._id, email: user.email}
                    });
                }
            );
        } else {
            return res.status(400).json({msg:'Invalid credentials'});
        }

    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

export { router as authRouter };