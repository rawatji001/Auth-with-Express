const userModel = require("../model/user.schema"); //for db schema

const emailValidator = require("email-validator"); //for validate email

const bcrypt = require("bcrypt"); // for password encryption

exports.signup = async (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;

  //* for all field required
  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Every field is required!!",
    });
  }

  //*for email validation
  const validEmail = emailValidator.validate(email);
  if (!validEmail) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid email address!",
    });
  }

  //* to check password===confirmPassword
  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Password and ConfirmPassword didn't match!",
    });
  }

  try {
    const userInfo = new userModel(req.body);
    const result = await userInfo.save();

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    //for clean message to user......
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Account already exists with provided email id",
      });
    }

    return res.status(400).json({
      message: error.message,
    });
  }
};

exports.signin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Every field is Required",
    });
  }

  try {
    const user = await userModel
      .findOne({
        email,
      })
      .select("+password");
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials!",
      });
    }

    const token = user.jwtToken();
    user.password = undefined;

    const cookieOption = {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
    };

    res.cookie("token", token, cookieOption);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getuser = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const user = await userModel.findById(userId);
    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.logout = async (req, res) => {
  try {
    const cookieOption = {
      expires: new Date(),
      httpOnly: true,
    };
    res.cookie("token", null, cookieOption);
    res.status(200).json({
      success: true,
      message: "Logged Out!!",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};



