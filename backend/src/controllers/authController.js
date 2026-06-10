const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

const registerUser = async (req, res) => {
  try {
  const  { name, email, password, role } = req.body;

  if(!name || !email || !password){
    return res.status(400).json({
      message : "Tüm alanlar zorunludur.",
    });
  }

  const existingUser = await prisma.user.findUnique({
    where :  {
      email : email
    }
  });
  if(existingUser){
    return res.status(400).json({
      message : "Bu e-posta kayıtlı!",
    });
  }

  const hashedPassword = await bcrypt.hash(password,10);

  const newUser = await prisma.user.create({
    data : {
      name,
      email,
      password: hashedPassword,
      role : role === "MANAGER" ? "MANAGER" : "MEMBER",
    },
    select : {
      id:true,
      name:true,
      email:true,
      role:true,
      createdAt:true,
    },
  });

  return res.status(201).json({
    message : "Kullanıcı Kayıt Oldu",
  });

  } catch (error) {
    console.error("register hatasi:", error);
    return res.status(500).json({
      message: "Sunucu hatasi",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if(!email || !password){
      return res.status(400).json({
        message : "E-mail ve Şifre zorunludur",
      });
    }

    const user = await prisma.user.findUnique({
      where : {
        email,
      }
    });
    if(!user){
      return res.status(404).json({
        message : "Kullanıcı Bulunamadı",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
      return res.status(401).json({
        message : "Şifre Hatalı",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role:user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h"
      }
    )

    return res.status(200).json({
      message:"Başarılı",
      token:token,
      user : {
        id:user.id,
        email:user.email,
        role:user.role,
        createdAt:user.createdAt,
      }
    })

  } catch (error) {
    console.error("register hatasi:", error);
    return res.status(500).json({
      message: "Sunucu hatasi",
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "Kullanici bulunamadi",
      });
    }

    return res.status(200).json({
      message: "Profil bilgileri getirildi",
      user,
    });
  } catch (error) {
    console.error("getProfile hatasi:", error);
    return res.status(500).json({
      message: "Sunucu hatasi",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
};
