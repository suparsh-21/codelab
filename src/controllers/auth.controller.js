const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const usermodel = require("../models/user.model");

const cookieOptions = {
  httpOnly: true,
  sameSite: "none",
  secure: true,
};


async function registerController(req, res) {
  try {
    const { email, password, username, securityQuestion, securityAnswer } = req.body;

    if (!email || !password || !username || !securityQuestion || !securityAnswer) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await usermodel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const hashedAnswer = securityAnswer.toLowerCase().trim();

    const user = await usermodel.create({
      email,
      username,
      password: hashedPassword,
      securityQuestion,
      securityAnswer: hashedAnswer,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("token", token, cookieOptions);

    return res.status(201).json({ message: "User registered successfully", token });
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}


async function loginController(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await usermodel.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("token", token, cookieOptions);

    return res.status(200).json({ message: "Login successful", token, username: user.username });
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}


async function logoutController(req, res) {
  res.clearCookie("token", cookieOptions);
  return res.status(200).json({ message: "Logout successful" });
}


async function getMeController(req, res) {
  try {
    const user = await usermodel.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        securityQuestion: user.securityQuestion,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}


async function getSecurityQuestionController(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await usermodel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email" });
    }

    if (!user.securityQuestion) {
      return res.status(400).json({ message: "No security question set for this account." });
    }

    return res.status(200).json({
      message: "Security question fetched",
      securityQuestion: user.securityQuestion,
    });
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}


async function resetPasswordController(req, res) {
  try {
    const { email, securityAnswer, newPassword } = req.body;

    if (!email || !securityAnswer || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await usermodel.findOne({ email }).select("+securityAnswer");
    if (!user) {
      return res.status(404).json({ message: "No account found with this email" });
    }

    const answerMatches = user.securityAnswer === securityAnswer.toLowerCase().trim();
    if (!answerMatches) {
      return res.status(400).json({ message: "Security answer is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function changePasswordController(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await usermodel.findById(req.userId).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  registerController,
  loginController,
  logoutController,
  getMeController,
  getSecurityQuestionController,
  resetPasswordController,
  changePasswordController,
};
