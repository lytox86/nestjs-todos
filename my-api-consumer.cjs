
const ApiClient = require('./api-consumer.cjs');

// Initialize API client
const api = new ApiClient('https://673790584eb22e24fca58f45.mockapi.io/api/v1');

const keypress = async () => {
  process.stdin.setRawMode(true);
  console.log('press any key to continue');
  return new Promise(resolve => process.stdin.once('data', () => {
    process.stdin.setRawMode(false);
    resolve();
  }))
};

// Example API calls
(async () => {
  try {
    console.log('fetching all users');
    await keypress();
    // all users
    let data = await api.get('/users');
    console.log(data);

    await keypress();
    console.log('adding new user');

    // add new user
    data = await api.post('/users', { username: 'username', password: 'password' });
    console.log(data);
    const newUserId = data.id;

    await keypress();
    console.log('reading new user');

    // single user
    data = await api.get(`/users/${newUserId}`);
    console.log(data);

    await keypress();
    console.log('modifying just added user');

    // modify added user
    data = await api.put(`/users/${newUserId}`, { username: 'newUsername', password: 'newPassword' });
    console.log(data);

    await keypress();
    console.log('deleting just added user');

    // delete added user
    data = await api.delete(`/users/${newUserId}`);
    console.log(data);

    await keypress();
    console.log('Bye!');

    process.exit();
  } catch (error) {
    console.error('Failed to fetch:', error.message);
  }
})();