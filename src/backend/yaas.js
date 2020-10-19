import axios from 'axios';

let SERVER_URL = "https://yaas.azurewebsites.net/";

if (process.env.NODE_ENV === "development"){
    SERVER_URL = "http://localhost:5000/";
}

const fetchWithTimeout = (uri, options = {}, time = 8000) => {
    const controller = new AbortController()
    const config = { ...options, signal: controller.signal }

    setTimeout(() => {
      controller.abort()
    }, time)

    return fetch(uri, config)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`${response.status}: ${response.statusText}`)
        }
        return response
      })
      .catch((error) => {
        if (error.name === 'AbortError') {
          throw new Error('Response timed out')
        }
        throw new Error(error.message)
      })
  }

export async function getDocument(docID) {
    const response = await fetchWithTimeout(SERVER_URL + "query?docID="+docID);
    const json = await response.json();
    return JSON.stringify(json);
};

export async function putDocument(documentJSON, docID) {
    const response = await fetchWithTimeout(SERVER_URL + "document?docID="+docID, {
        method: 'PUT',
        body: JSON.stringify(documentJSON),
        headers: new Headers({
            'Content-Type': 'application/json'
          })
    });
    if (response.ok) {
        alert("Document Saved Successfully");
    }
}

export async function loginBackend(name, email, token) {
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': `token=${token}`
            },
        body: JSON.stringify({ name: name, email: email, token: token })
    };
    const response = await axios.post(SERVER_URL + "register_user", requestOptions, {
        withCredentials: true
    });
    
    const data = await response.json();
    console.log(data);
    return response.ok;
}
