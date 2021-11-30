import Cookies from 'js-cookie';

function Network(endPoint, { body, ...customConfig } = {}) {
    const headers = {
        "Content-Type": "application/json;charset=utf-8'",
        "Authorization": `Berear ${Cookies.get('accessToken')}`
    };

    const url = `${endPoint}`

    const config = {
        method: body ? "POST" : "GET",
        ...customConfig,
        headers: {
            ...headers,
            ...customConfig.headers,
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
    };

    // console.log(`Sending ${config.method} to ${url} with data:`, body);

        return fetch(url, config).then(async (response, reject) => {
            let data;
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                data = await response.json()
            } else {
                data = await response.text()
            }
            if (response.ok) {
                console.log(`Got response ${response.status}`, data);
                return data
            } else {
                console.error(`${response.status} : '${data}'`);
                throw data
            }
        });
}

Network.get = (endPoint) => Network(endPoint, { method: "GET" });
Network.post = (endPoint, body) => Network(endPoint, { method: "POST", ...body });
Network.put = (endPoint, body) => Network(endPoint, { method: "PUT", ...body });
Network.delete = (endPoint) => Network(endPoint, { method: "DELETE" });
Network.options = (endPoint) => Network(endPoint, { method: "OPTIONS" });

export default Network;
