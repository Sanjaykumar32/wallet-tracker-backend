const express = require("express");
const mongoose = require("mongoose");
const bodyperser = require("body-parser");
const cors = require("cors");
const server = express();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "NODETOKENCREATE";

mongoose
  .connect("mongodb+srv://sanjay:87199032@cluster0.4osey.mongodb.net/Wallet")
  .then(() => {
    console.log("mongodb conected");
  })
  .catch((error) => {
    console.log(error);
  });

const mongooseSchema = new mongoose.Schema({
  amount: Number,
  name: String,
  totalAmount: String,
  id: String,
  email: String,
  password: String,
  userName: String,
  lastName: String,
});

const mongodbData = mongoose.model("Wallet", mongooseSchema);

server.use(bodyperser.json());
server.use(cors());

server.post("/create", async (req, res) => {
  const { name, email, password, amount, totalAmount, id } = req.body;
  try {
    await mongodbData.create({
      name,
      email,
      password,
      amount,
      totalAmount,
      id,
    });
    res.send(req.body);
    res.send("Data is save is successfuly");
  } catch (error) {
    res.send(error);
  }
});

// <----------------------- signUp -------------------->

server.post("/signUp", async (req, res) => {
  console.log(req.body);
  const { userName, lastName, email, password } = req.body;

  try {
    const existinguser = await mongodbData.findOne({ email: email });

    if (existinguser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const result = await mongodbData.create({
      userName: userName,
      lastName: lastName,
      email: email,
      password: hashPassword,
    });

    const token = jwt.sign({ email: result.email, id: result._id }, SECRET_KEY);
    res.status(201).json({ result: result, token: token });
  } catch (error) {
    res.status(500).json({ massage: "Somthing went wrong" });
  }
});

// <<<<<<<--------------- sign In ----------------->>>>>>>>>>>>


server.post("/signIn" , async (req , res)=> {
   const {email, password} = req.body
   console.log(email , password)
  try {
    
    const existinguser =  await mongodbData.findOne({email : email})

    if(!existinguser){
      return res.status(404).json({message : "User not found"})
    }

    const matchPassword =  await bcrypt.compare(password , existinguser.password)

    if(!matchPassword){
      return res.status(400).json({message : "Invalid  Credentials "})
    }

    const token =  jwt.sign({ email :existinguser.email , id : existinguser._id} , SECRET_KEY)
    res.status(201).json({ result : existinguser , token : token})

  } catch (error) {
      res.status(500).json({message : "Somthing went wrong"})
  }
})

// <<<<<<<<<<<<< ----------------  get Data --------------->>>>>>>>>>>>>>>.

server.get("/getData", async (req, res) => {
  try {
    const allData = await mongodbData.find();
    res.send(allData);
  } catch (error) {
    res.send(error);
  }
});

server.delete("/deleteData", async (req, res) => {
  const { id } = req.body;
  try {
    await mongodbData.deleteOne({ id });
    res.send("Data is delete is successfully");
  } catch (error) {
    res.send(error);
  }
});

server.post("/updateData", async (req, res) => {
  try {
    const updateData = await mongodbData.updateOne();
  } catch (error) {
    console.log(error);
  }
});

server.listen(8000, () => {
  console.log("wallet tracker start");
});
