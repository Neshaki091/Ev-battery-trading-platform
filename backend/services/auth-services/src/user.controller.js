const { generateRefreshToken, generateAccessToken, addUserRefreshToken, deleteUserRefreshToken, getUserRefreshToken } = require('../util/refreshToken');
const userschema = require('../models/user.model');
const bcrypt = require('bcrypt');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await userschema.find();
        if (!users || users.length === 0) {
            return res.status(403).json({ message: 'No users found' });
        }

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving users', error });
    }
};


exports.getAllUsersProfiles = async (req, res) => {
    try {
        const users = await userschema.find();
        if (!users || users.length === 0) {
            return res.status(403).json({ message: 'No users found' });
        }

        res.status(200).json(users.map(u => ({
            profile: u.profile,
            macthedProfiles: u.macthedProfiles
        })));

    } catch (error) {
        res.status(500).json({ message: 'Error retrieving users', error });
    }
};
exports.getMe = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(400).json({ message: "Missing user ID in token" });
        }

        const user = await userschema.findById(userId).select("_id profile macthedProfiles");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            user_id: user._id,
            profile: user.profile,
            macthedProfiles: user.macthedProfiles
        });
    } catch (error) {
        res.status(500).json({
            message: "Error retrieving user",
            error: error.message
        });
    }
};

exports.getUserById = async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await userschema.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ user_id: user._id, userprofile: user.profile, macthedProfiles: user.macthedProfiles });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving user', error });
    }
};
exports.createUser = async (req, res) => {
    const { phonenumber, email, password } = req.body;
    try {

        const userExists = await userschema.findOne({ "profile.email": email });
        if (!phonenumber) {
            return res.status(401).json({ message: 'phone number is not in request' })
        }
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = new userschema({
            profile: { email, phonenumber },
            password: passwordHash
        });
        console.log('Creating user with data:', newUser);
        newUser.password = passwordHash;
        console.log('Hashed password:', passwordHash);
        await newUser.save();
        console.log('User created successfully:', newUser);
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error });
    }
};

exports.updateUser = async (req, res) => {
    const userId = req.params.id;
    let { username, email } = req.body;
    const user = req.user
    try {
        if (!email) {
            email = user.profile.email
            console.log(email);
        }
        if (!username) {
            username = user.profile.username
            console.log(username);
        }
        let updateData = {
            "profile.username": username,
            "profile.email": email
        };
        const updatedUser = await userschema.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        );
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({
            message: 'User updated successfully',
            profile: updatedUser.profile,
            macthedProfiles: updatedUser.macthedProfiles
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error });
    }
};


exports.deleteUser = async (req, res) => {
    const userId = req.params.id;
    try {
        const deletedUser = await userschema.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error });
    }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userschema
            .findOne({ "profile.email": email });
        if (!user) {
            return res.status(401).json({ message: 'Account is not exist' });
        }
        if (!await bcrypt.compare(password, user.password)) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const refreshToken = generateRefreshToken(user._id);
        const accessToken = generateAccessToken(user._id);
        await addUserRefreshToken(user._id, refreshToken, accessToken);
        console.log('User logged in:', user.profile, user.macthedProfiles, accessToken);

        res.status(200).json({ message: 'Login successful', user_id: user._id, user: user.profile, macthedProfiles: user.macthedProfiles, accessToken: accessToken, });
    } catch (error) {
        res.status(500).json({ message: 'Error during login', error });
    }
};

exports.logoutUser = async (req, res) => {
    const userId = req.user._id;
    const accessToken = req.headers.authorization;
    await deleteUserRefreshToken(userId, accessToken);
    res.status(200).json({ message: 'Logout successful' });
}

exports.changePassword = async (req, res) => {
    const userId = req.params.id;
    const { oldPassword, newPassword } = req.body;
    try {
        const user = await userschema.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid old password' });

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error changing password', error });
    }
};

