const jwt = require('jsonwebtoken')



module.exports = (req, res, next)=>{
    try{
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, 'la_verdad_me_mata_tener_que_escribir_todo_esto_para_poder_generar_un_token');
    console.log('decodedToken', decodedToken)
    req.userData = {email: decodedToken.email, userId: decodedToken.userId}
    next(); 
    } catch (error) { 
        res.status(401).json({
            message: 'Auth failed!'
        });
    }
}