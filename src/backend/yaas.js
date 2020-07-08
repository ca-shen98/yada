import React from 'react';

var SERVER_URL = ""
if (process.env.NODE_ENV == "development"){
    SERVER_URL = "http://localhost:5000/";
}else{
    SERVER_URL = "https://yaas.azurewebsites.net/";
}

export async function getDocument(docID) {

    const response = await fetch(SERVER_URL + "query?docID="+docID);
    const json = await response.json();
    return JSON.stringify(json);
};

export async function putDocument(documentJSON, docID) {
    const response = await fetch(SERVER_URL + "document?docID="+docID, {
        method: 'PUT',
        body: JSON.stringify(documentJSON),
        headers: new Headers({
            'Content-Type': 'application/json'
          })
    });
    alert("Document Saved Successfully")
}