import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// CSRF protection disabled for development
// Commenting out CSRF token handling since we've disabled CSRF protection

/*
// Set CSRF token from meta tag
function setCSRFToken() {
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (token) {
        window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token;
    }
}

// Set initial token
setCSRFToken();

// Update CSRF token after each response to keep it fresh
window.axios.interceptors.response.use(
    response => {
        // Update CSRF token from response header if provided
        const token = response.headers['x-csrf-token'];
        if (token) {
            window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token;
            document.querySelector('meta[name="csrf-token"]')?.setAttribute('content', token);
        }
        return response;
    },
    error => {
        // If we get a 419 error, try to refresh the token
        if (error.response?.status === 419) {
            setCSRFToken();
            // Re-attempt the original request with the new token
            return window.axios.request(error.config);
        }
        return Promise.reject(error);
    }
);
*/
