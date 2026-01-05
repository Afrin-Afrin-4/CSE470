const bcrypt = require('bcryptjs');

const hashInDB = '$2a$10$HxO4NNO0truiowjfy2UJIeJDcsH3sXO7TFlaZcgeYbxUGrJLOYKzm';
const plainPassword = '12345678';

const test = async () => {
    const isMatch = await bcrypt.compare(plainPassword, hashInDB);
    console.log('Password Match Result:', isMatch);
};

test();
