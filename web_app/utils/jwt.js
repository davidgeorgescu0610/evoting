const jwt = require('jsonwebtoken');

const verifyJwt = (request, response, next) => {
    const authHeader = request.headers['authorization'];
    if(!authHeader)
        return response.sendStatus(401);
        

    const token = authHeader.split(' ')[1];
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if(err)
                return response.sendStatus(403);

            request.person_id = decoded.person_id;
            next();
        }
    );
}

module.exports = verifyJwt;