const mongoose = require("mongoose"); // to connect db

const { Schema } = mongoose; // structure of data

const JWT = require("jsonwebtoken"); //jwt web tokens

const bcrypt = require("bcrypt"); // for password encryption

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "User name is Required!"],
      minLength: [5, "Name must be atleast 5 char"],
      maxLength: [50, "Mane must be less than 50 char"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "User email is Required!"],
      lowercase: true,
      unique: [true, "Already registerd!"],
    },
    password: {
      type: String,
      select: false,
    },
    forgotPasswordToken: {
      type: String,
    },
    forgotPasswordExpiryDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  return next();
});

userSchema.methods = {
  jwtToken() {
    return JWT.sign({ id: this._id, email: this.email }, process.env.SECRET, {
      expiresIn: "24h",
    });
  },
};

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;
