const API_URL = 'http://localhost:3000/api';

export const api = {
    exercises: `${API_URL}/exercises`,
    programs: `${API_URL}/programs`,
    workouts: `${API_URL}/workouts`,
    history: `${API_URL}/history`,
    auth: `${API_URL}/auth`,
    user: `${API_URL}/user`,
    users: `${API_URL}/users`,
};

let isRefreshing = false;
let refreshQueue = [];

const processQueue = (error) => {
    refreshQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve();
    });
    refreshQueue = [];
};

export const authFetch = async (url, options = {}) => {
    const config = {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    };

    let response = await fetch(url, config);

    if (response.status === 401) {
        if (!isRefreshing) {
            isRefreshing = true;
            try {
                const refreshRes = await fetch(`${api.auth}/refresh`, {
                    method: 'POST',
                    credentials: 'include',
                });
                if (refreshRes.ok) {
                    isRefreshing = false;
                    processQueue(null);
                    response = await fetch(url, config);
                } else {
                    isRefreshing = false;
                    processQueue(new Error('Session expired'));
                    return response;
                }
            } catch (err) {
                isRefreshing = false;
                processQueue(err);
                return response;
            }
        } else {
            await new Promise((resolve, reject) => {
                refreshQueue.push({ resolve, reject });
            });
            response = await fetch(url, config);
        }
    }

    return response;
};
