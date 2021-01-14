import axios from 'axios';
import Cookies from 'js-cookie'

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
    const data = await axios.post(SERVER_URL + "register_user", requestOptions, {
        withCredentials: true
    });
    return true;
}
//TODO: create our own request wrapper that includes token & common headers
export async function getCardView(docID, viewID) { // TODO: rename
    try {
        // const response = await fetchWithTimeout(`${SERVER_URL}view?docID=${docID}&viewID=${viewID}&viewName=${CARD_VIEW_NAME}`);
        const token = Cookies.get('access_token');
        const current_view_data = await fetchWithTimeout(`${SERVER_URL}view?docID=${docID}&viewID=${viewID}&viewName=textView1`, {
          method: 'GET',
          headers: new Headers({
              'Content-Type': 'application/json',
              'Set-Cookie': `token=${token}`
            })
        });
        const all_tag_data = await fetchWithTimeout(`${SERVER_URL}tags?docID=${docID}`, {
            method: 'GET',
            headers: new Headers({
                'Content-Type': 'application/json',
                'Set-Cookie': `token=${token}`
              })
          });
        const view_json = await current_view_data.json();
        const tags_json = await all_tag_data.json();
        return [view_json, tags_json];
    } catch (err) {
        const front_1 = {
            "type": "heading",
            "attrs": {
                "hidden": false,
                "level": 1
            },
            "content": [
                {
                    "type": "text",
                    "text": "How many bones are in a shark's body"
                }
            ]
        };
        const back_1 = {
            "type": "paragraph",
            "attrs": {
                "hidden": false
            },
            "content": [
                {
                    "type": "text",
                    "text": "0 bones - "
                },
                {
                    "type": "text",
                    "marks": [
                        {
                            "type": "strong"
                        }
                    ],
                    "text": "shark skeleton is all cartilage"
                }
            ]
        };
        const front_2 = {
            "type": "heading",
            "attrs": {
                "hidden": false,
                "level": 1
            },
            "content": [
                {
                    "type": "text",
                    "text": "How do you print \"Hello World\" in Python3?"
                }
            ]
        };
        const back_2 = {
            "type": "paragraph",
            "attrs": {
                "hidden": false
            },
            "content": [
                {
                    "type": "text",
                    "marks": [
                        {
                            "type": "code_inline"
                        }
                    ],
                    "text": "print(\"Hello World\")"
                }
            ]
        };
        
        let allTags = ['uuid1', 'uuid2', 'uuid3', 'uuid4']
        
        return {
            tags: {
                'uuid1': {"id": "uuid1", "name": "question", "content": front_1},
                'uuid2': {"id": "uuid2", "name": "answer",   "content": back_1},
                'uuid3': {"id": "uuid3", "name": "question", "content": front_2},
                'uuid4': {"id": "uuid4", "name": "answer",   "content": back_2},
            },
            tagsInView: ["uuid1", "uuid2"],
            allTags: allTags
        }
    }
};

export async function putCardView(cardJSON, docID, viewID) {
    const response = await fetchWithTimeout(`${SERVER_URL}query?docID=${docID}&viewID=${viewID}`, {
        method: 'PUT',
        body: JSON.stringify(cardJSON),
        headers: new Headers({
            'Content-Type': 'application/json'
        })
    });
    if (response.ok) {
        alert("Card View Saved Successfully");
    }
}
