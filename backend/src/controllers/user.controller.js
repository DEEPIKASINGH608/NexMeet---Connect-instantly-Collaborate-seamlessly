import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import bcrypt, { hash } from "bcrypt";
import crypto from "crypto";

const login = async (req, res) => {

    const { username, password } = req.body;

    if(!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
        }

        let isPasswordValid = await bcrypt.compare(password, user.password);
        if (isPasswordValid) {
            let token = crypto.randomBytes(20).toString("hex");

            user.token = token;
            await user.save();
            return res.status(httpStatus.OK).json({ token: token });
        } else {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid Username or password" });
        }

    } catch (e) {
        return res.status(500).json({ message: "Error logging in", error: e.message });
    }

};

const register = async (req, res) => {
    const { name, username, password } = req.body;

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(httpStatus.FOUND).json({ message: "Username already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name: name,
            username: username,
            password: hashedPassword,
        });

        await newUser.save();

        res.status(httpStatus.CREATED).json({ message: "User registered successfully" });

    } catch (e) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error registering user", error: e.message });
    }
};

const getUserHistory = async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: "Token is required" });
    }

    try {
        const user = await User.findOne({ token: token });
        if (!user) {
            return res.status(httpStatus.OK).json([]);
        }

        const meetings = await Meeting.find({ user_id: user.username });
        return res.status(httpStatus.OK).json(meetings);
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: `Something went wrong: ${e.message}` });
    }
};

export { login, register, getUserHistory };

