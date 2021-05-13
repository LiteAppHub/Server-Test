const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
var Airtable = require("airtable");
const { post } = require('./activate');
const airtableKey = require('../models/airtableAPI')
var base = new Airtable({ apiKey: airtableKey.key}).base(airtableKey.base
);

const users = base("Teams");



router.post('/signup', async (req, res, next)=>{
    console.log('Signing up', req.body)
    bcrypt.hash(req.body.password, 10).then((hash)=>{
        const user = new User({
        email: req.body.email,
        password: hash
    })
    console.log('new user data', user)
    
    user.save().then(result => {
        console.log('Usuario guardado', result)
    
    saveAirtableUser(req.body.email)
    

        res.status(201).json({
            message: 'Usuario creado',
            result: result
        })
        
    }).catch(err =>{
        res.status(500).json({
            message: 'El usuario ya se encuentra registrado'
        })
    })
})

})

async function saveAirtableUser(user){
    //SAVING USER TU AIRTABLE -------
console.log('saving Airtable User')
    newUser = await users.create([
      {
    "fields": {
        "UserId": user,
    }
  }], function(err, records) {
  if (err) {
    console.error(err);
    return;
  }
})
}


router.post('/update', async (req, res, next)=>{

console.log('Updating user', req.body)

const filter = "AND({UserRecord} = '" + req.body.recordId + "', {UserId} = '" + req.body.email + "')"
  console.log('User recordId requested', filter)
  
  try{

    myUser = await users.select(
    {
    'filterByFormula': filter
  }
  ).all()
    
  console.log('myUser', myUser)
  if(myUser === []){
      res.status(422).json({
        message: 'Usuario inexistente',
    })
  }
     next ()
  }

  catch{
    res.status(422).json(
    {message: 'Falló usuario'}
    );
  }

    bcrypt.hash(req.body.password, 10).then(async (hash)=>{
    //     const user = new User({
    //     email: req.body.email,
    //     password: hash
    // })
    
    await User.findOneAndUpdate({"email": req.body.email},{$set:{"password": hash}}, (err, doc) =>{
     
        console.log('mongoose error', err)
        console.log('mongoose doc', doc)

    }).catch(err =>{
        res.status(500).json({
            message: 'El usuario ya se encuentra registrado'
        })
    })
})
    })
    
    

// async function updateAirtableUser(user){
//     //SAVING USER TU AIRTABLE -------
// console.log('saving Airtable User')

// try{
// userUpdate = await users.update([
//       {
// "id": user,
// "fields": {
// "UserNeedsReset": false,
// }

// }], function(err, records) {
//   if (err) {
//     console.error(err);
//     return;
//   }
// })}
// catch{
//     res.status(500).json({
//         message: 'Unable to set user reset request to false'
//     })
// }
// }


router.post('/activate', async (req, res, next)=>{

console.log('params', req.body.userRecord)
userActivation = await users.update([
{
"id": req.body.userRecord,
"fields": {
"UserHasVerified": true,
}

}], function(err, records) {
if (err) {
console.error(err);
return;
}
})

})



router.post('/login', (req, res, next)=>{
let fetchedUser;
console.log(req.body)
    User.findOne({email: req.body.email})
    .then(user=>{
        if(!user){
             res.status(401).json({
                message: "La clave o el usuario son incorrectos"
            })
        }
        fetchedUser = user;
        return bcrypt.compare(req.body.password, user.password)
    }).then(result=>{
        console.log('Resultado:', result)
        if(!result){
             res.status(401).json({
                message: "La clave o el usuario son incorrectos."
            })
        }
        const token = jwt.sign(
            {email: fetchedUser.email, userId: fetchedUser._id }, process.env.JWT_KEY , {expiresIn: '1h'})
            // console.log(token)
        
        return token
        
        }).then(async (token)=>{
        // console.log('token:',token)
        const filter = "({UserId} = '" + req.body.email + "')"
        // console.log('requested', req.body.email)
        try {
        activeUser = await users.select(
        {
        'filterByFormula': filter
        }
        ).all()

        // console.log('Usuario para activar:', fetchedUser._id)
        
    } catch {
         res.status(401).json({
            message: 'Usuario no activo'
        })}
        console.log('is active?', activeUser)
        
        return {activeUser: activeUser[0].fields.UserHasVerified , token: token}


    }).then((activeUser)=>{
        console.log('Active user', activeUser.activeUser, activeUser.token)
        
        if(!activeUser.activeUser){
             res.status(401).json({
                message: 'El usuario no fue activado aún'
            })
        }else{
         res.status(200).json({
        token: activeUser.token,
        expiresIn: 3600,
        userId: fetchedUser._id,
        }) }
    
    }).catch(err=>{
         res.status(401).json({
            message: 'La clave o el usuario son incorrectos'
        })
    })
})



router.post('/reset', async (req, res, next)=>{
    
console.log('requesting reset from the server', req.body.email)
//Search User by email
const filter = "({UserId} = '" + req.body.email + "')"

try {
activeUser = await users.select(
{
'filterByFormula': filter
}
).all()

next()

} catch {
 res.status(401).json({
    message: 'Usuario no activo'
})}

console.log('is active?', activeUser[0].fields)

try{
sendReset = await users.update([
{
"id": activeUser[0].fields.UserRecord,
"fields": {
"UserNeedsReset": true,

}

}], function(err, records) {
if (err) {
console.error('No se ha podido enviar la solicitud de cambio de clave', err);
return;
}

})

 res.status(200).json({
    message: 'Enviando solicitud de cambio de clave',
    result: sendReset
})

} catch{

    res.status(401).json({
        message: 'No se ha podido enviar la solicitud de cambio de clave'
    })

}

setTimeout(async ()=>{
try{
sendReset = await users.update([
{
"id": activeUser[0].fields.UserRecord,
"fields": {
"UserNeedsReset": false,

}

}], function(err, records) {
if (err) {
console.error('No se ha podido enviar la solicitud de cambio de clave', err);
return;
}

})

 res.status(200).json({
    message: 'Enviando solicitud de cambio de clave',
    result: sendReset
})

} catch{

     res.status(401).json({
        message: 'No se ha podido enviar la solicitud de cambio de clave'
    })

}
},3000)


})

module.exports = router;