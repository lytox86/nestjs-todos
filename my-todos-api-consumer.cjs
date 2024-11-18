
const ApiClient = require('./api-consumer.cjs');

// Initialize API clients
const apiClient = new ApiClient('https://nestjs-todos-o0h8.onrender.com/v1');

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

    console.log('accessing protected endpoint');
    try {
      await apiClient.get(`/tasks`);
    } catch (error) {
      console.log(error.code + ". Unauthorized");
    }

    console.log('wrong credentials');
    try {
      await apiClient.get('/users/login', {username: "admin", password: "wrong"});
    } catch (error) {
      console.log(error.code + ". Invalid credentials");
    }

    console.log('wrong params');
    try {
      await apiClient.get('/users/login', {username: "admin"});
    } catch (error) {
      console.log(error.code + ". Password missing");
    }

    console.log('register new user');
    let data;
    const newUser = `johndoe-${Math.random()}`;
    data = await apiClient.post('/users/register', {
      username: newUser,
      email: "johndoe@example.com",
      password: "password123"
    });
    const userId = data.id;
    console.log(data);


    console.log('Log in as admin');
    await keypress();

    let response = await apiClient.post('/users/login', {username: "admin", password: "admin"});
    let token = response.access_token;
    console.log(token);
    apiClient.setToken(token);

    data = await apiClient.get('/users/who-am-i');
    console.log(data);

    console.log('fetching all users');
    await keypress();

    // Users
    data = await apiClient.get('/admin/users');
    console.log(data);

    console.log('fetching single user');
    await keypress();

    data = await apiClient.get(`/admin/users/${userId}`);
    console.log(data);

    const newPassword = "password1234";
    console.log('changing password');
    await keypress();

    await apiClient.put(`/admin/users/${userId}/change-password`,{
      newPassword: newPassword
    });
    console.log('changed');

    console.log('wrong user');
    await keypress();

    try {
      await apiClient.get('/admin/users/999999');
    } catch (error) {
      console.log(error.code + ". Not Found");
    }

    console.log('logging now with new password');
    response = await apiClient.post('/users/login', {username: newUser, password: newPassword});
    token = response.access_token;
    apiClient.setToken(token);

    data = await apiClient.get('/users/who-am-i');
    console.log(data);

    console.log('logging now as other user');
    response = await apiClient.post('/users/login', {username: 'testuser1', password: 'testuser1'});
    token = response.access_token;
    apiClient.setToken(token);

    data = await apiClient.get('/users/who-am-i');
    console.log(data);

    console.log('fetching all tasks');
    await keypress();

    // Tasks
    data = await apiClient.get('/tasks');
    console.log(data);

    console.log('adding a task');
    data = await apiClient.post('/tasks',{
      name: "Buy milk",
      priority: 1,
      deadline: "2024-11-19T10:10:46.788Z"
    });
    console.log(data);
    const taskId = data.id;

    await keypress();

    console.log('getting a single task');
    data = await apiClient.get(`/tasks/${taskId}`);
    console.log(data);

    await keypress();

    console.log('editing a task');
    data = await apiClient.patch(`/tasks/${taskId}`,{
      name: "Buy bread",
      completed: true
    });
    console.log(data);

    await keypress();

    console.log('deleting a task');
    await apiClient.delete(`/tasks/${taskId}`);
    console.log('deleted');
    try {
    await apiClient.get(`/tasks/${taskId}`);
    } catch (error) {
      console.log(error.code + ". Task is deleted");
    }

    await keypress();

    console.log('Bye!');

    process.exit();
  } catch (error) {
    console.error('Failed to fetch:', error.message);
  }
})();