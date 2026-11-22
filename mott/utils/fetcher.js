

//get and validate match xsrf-token
function getXsrfToken() {
    const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
}

//global fetcher with retry
export default async function fetcher(path, options = {}, retry = true) {
    const isJson = options.body !== undefined && !(options.body instanceof FormData) && typeof options.body !== 'string';

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
        ...options,
        credentials: 'include',
        headers: {
            Accept: 'application/json',
            ...(isJson && { 'Content-Type': 'application/json' }),
            'X-XSRF-TOKEN': getXsrfToken() ?? '',
            ...options.headers,
        },
        body: isJson ? JSON.stringify(options.body) : options.body,

    });

    //retry request
    if(response.status === 419 && retry) {
        await fetcher('/sanctum/csrf-cookie', {}, false);
        return fetcher(path, options, false);
    }

    return response;
}