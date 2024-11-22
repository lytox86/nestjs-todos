const axios = require('axios');

class ApiClient {
  constructor(baseURL, headers = {}) {
    this.token = '';
    this.client = axios.create({
      baseURL,
      headers,
    });
  }

  setToken(token) {
    this.token = token;
    this.client.interceptors.request.use((config) => {
      config.headers.set('Authorization', `Bearer ${this.token}`);
      return config;
      //console.log(config.headers);
    });
  }

  // Generic GET method
  async get(endpoint, params = {}) {
    try {
      const response = await this.client.get(endpoint, { params });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Generic POST method
  async post(endpoint, data = {}) {
    try {
      const response = await this.client.post(endpoint, data);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Generic PATCH method
  async patch(endpoint, data = {}) {
    try {
      const response = await this.client.patch(endpoint, data);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Generic PUT method
  async put(endpoint, data = {}) {
    try {
      const response = await this.client.put(endpoint, data);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Generic DELETE method
  async delete(endpoint, data = {}) {
    try {
      const response = await this.client.delete(endpoint, data);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Error handler
  handleError(error) {
    console.error(
      `Error: ${error.response?.status} - ${JSON.stringify(error.response?.data) || error.message}`,
    );
    throw error;
  }
}

module.exports = ApiClient;
