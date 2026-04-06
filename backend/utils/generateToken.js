import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  // Since it's an API, usually we just return the token to be used as Bearer token in headers.
  // Alternatively we can set cookie. For simplicity and MERN standard, returning it is easiest.
  return token;
};

export default generateToken;
