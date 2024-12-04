const User = require("../models/User");
const { generateToken } = require("../config/auth");

// User Registration
exports.register = async (req, res) => {
  const { name, email, role, language, password } = req.body;
  try {
    const user = new User({
      name,
      email,
      role,
      language,
      password,
    });
    await user.save();

    const token = generateToken(user._id);
    res
      .status(201)
      .json({ message: "User registered successfully.", token, user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Registration failed.", error: error.message });
  }
};

// User Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Input validation
  if (!email || !password) {
    return res.status(400).json({ message: "Name and password are required." });
  }

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Generate an authentication token
    const token = generateToken(user._id);

    // Respond with the user's data and token
    res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        language: user.language,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed.", error: error.message });
  }
};

// Fetch user list
exports.getUserList = async (req, res) => {
  const { userId } = req.params;

  try {
    // Find all users except the one with the given userId
    const users = await User.find({ _id: { $ne: userId } }).select(
      "-password" // Exclude sensitive fields like password
    );

    res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch user list.", error: error.message });
  }
};

// Fetch user by ID
exports.getUser = async (req, res) => {
  const { userId } = req.params;

  try {
    // Find user by ID and exclude the password field
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch user.", error: error.message });
  }
};
