import registerUser from './register-user.js';
import loginUser from './login-user.js';

const authModel = {
  register: registerUser,
  login: loginUser,
};
export default authModel;
