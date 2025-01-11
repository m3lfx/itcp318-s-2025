const User = require('../models/user');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail')
const crypto = require('crypto')
const cloudinary = require('cloudinary')
const admin = require("firebase-admin");
var serviceAccount = require('../config/firebase.json')

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     databaseURL: "https://fir-app-fd8f1-default-rtdb.firebaseio.com"
//   });

exports.registerUser = async (req, res, next) => {
   
    const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: 'avatars',
        width: 150,
        crop: "scale"
    }, (err, res) => {
        console.log(err, res);
    });
    console.log(result)
    const { name, email, password,  } = req.body;
    const user = await User.create({
        name,
        email,
        password,
        avatar: {
            public_id: result.public_id,
            url: result.secure_url
        },
    })
    //test token
    //  const token = user.getJwtToken();

    // return  res.status(201).json({
    //   	success:true,
    //   	user,
    //  	token
    //   })
    sendToken(user, 200, res)
}

exports.loginUser = async (req, res, next) => {
    const { email, password } = req.body;

    // Checks if email and password is entered by user
    if (!email || !password) {
        return res.status(400).json({ error: 'Please enter email & password' })
    }
  

    // Finding user in database
    // const userPass = await User.findOne({ email }).select('+password')
    let user = await User.findOne({ email }).select('+password')
    if (!user) {
        return res.status(401).json({ message: 'Invalid Email or Password' })
    }
   

    // Checks if password is correct or not
    const isPasswordMatched = await user.comparePassword(password);

   
    if (!isPasswordMatched) {
        return res.status(401).json({ message: 'Invalid Email or Password' })
    }
    // const token = user.getJwtToken();

    //  return res.status(201).json({
    //  	success:true,
    //     user,
    //  	token
    //  });
    //  user = await User.findOne({ email })
    sendToken(user, 200, res)
}

exports.getUserProfile = async (req, res, next) => {
    const user = await User.findById(req.user.id);

    return res.status(200).json({
        success: true,
        user
    })
}

exports.updateProfile = async (req, res, next) => {
   console.log(req.body.email)
    const newUserData = {
        name: req.body.name,
        email: req.body.email
    }

    // Update avatar
    if (req.body.avatar !== '') {
        let user = await User.findById(req.user.id)
        // console.log(user)
        const image_id = user.avatar.public_id;
        // const res = await cloudinary.v2.uploader.destroy(image_id);
        // console.log("Res", res)
        const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: 'avatars',
            width: 150,
            crop: "scale"
        },  (err, res) => {
            console.log(err, res);
        })

        newUserData.avatar = {
            public_id: result.public_id,
            url: result.secure_url
        }
    }

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
    })
    if (!user) {
        return res.status(401).json({ message: 'User Not Updated' })
    }

    return res.status(200).json({
        success: true
    })
}

exports.updatePassword = async (req, res, next) => {
    console.log(req.body.password)
    const user = await User.findById(req.user.id).select('+password');
    // Check previous user password
    const isMatched = await user.comparePassword(req.body.oldPassword)
    if (!isMatched) {
        return res.status(400).json({ message: 'Old password is incorrect' })
    }
    user.password = req.body.password;
     await user.save();
    // const token = user.getJwtToken();

    //  return res.status(201).json({
    //  	success:true,
    //     user,
    //  	token
    //  });
    sendToken(user, 200, res)

}

exports.forgotPassword = async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return res.status(404).json({ error: 'User not found with this email' })
       
    }
    // Get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    // Create reset password url
    const resetUrl = `${req.protocol}://localhost:5173/password/reset/${resetToken}`;
    const message = `Your password reset token is as follow:\n\n${resetUrl}\n\nIf you have not requested this email, then ignore it.`
    try {
        await sendEmail({
            email: user.email,
            subject: 'ShopIT Password Recovery',
            message
        })

        return res.status(200).json({
            success: true,
            message: `Email sent to: ${user.email}`
        })

    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return res.status(500).json({ error: error.message })
     
    }
}

exports.resetPassword = async (req, res, next) => {
    // Hash URL token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    })

    if (!user) {
        return res.status(400).json({ message: 'Password reset token is invalid or has been expired' })
       
    }

    if (req.body.password !== req.body.confirmPassword) {
        return res.status(400).json({ message: 'Password does not match' })
      
    }

    // Setup new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    // const token = user.getJwtToken();

    //  return res.status(201).json({
    //  	success:true,
    //     user,
    //  	token
    //  });
    sendToken(user, 200, res)
}

exports.allUsers = async (req, res, next) => {
    const users = await User.find();
    if (!users) {
        return res.status(400).json({ error: 'no users found' })
    }
    
    return res.status(200).json({
        success: true,
        users
    })
}

exports.getUserDetails = async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(400).json({ message: `User does not found with id: ${req.params.id}` })
       
    }

    return res.status(200).json({
        success: true,
        user
    })
}

exports.updateUser = async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        // useFindAndModify: false
    })

    if (!user) {
        return res.status(400).json({ message: `User not updated ${req.params.id}` })
       
    }


    return res.status(200).json({
        success: true
    })
}

// exports.sendMessage = async (req, res, next) => {
    
    
   
//     const message = {
//         notification: {
//             title: 'Message from node nov 7',
//             body: 'hello pushy',
//             imageUrl: 'https://res.cloudinary.com/dgneiaky7/image/upload/v1728010631/products/pstnuskit4hycbl81dlb.png'
//         },
//         // topic
//         token: 'fiWWQn_-4m5gclosAWhNyb:APA91bEClp3LaZjESHT8zCpeOQhwif6Dhxfx4dno_6MwrJy2Q904UroXJ2jw7j5G-brb1stxWRAbd1Hz8nE0K1UuOg2AmuQAXHuwQnDK0RoOfJJT9FksFjs',
//     };
//     try {
//         response = await admin.messaging().send(message)
//         console.log('Node nov 7:', response);
//         return res.status(200).json({ message: 'success sent message', response })
//     } catch (error) {
//         console.log('Error sending message:', error);
//         return res.status(200).json({ message: error })

//     }
//  }

