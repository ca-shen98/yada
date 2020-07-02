import React from 'react';

export async function getDocument(docID) {

    const response = await fetch("http://localhost:5000/query?docID="+docID);

    const json = await response.json();
    console.log(json)
    return JSON.stringify(json);
};

export async function putDocument(documentJSON, docID) {
    const response = await fetch("http://localhost:5000/document?docID="+docID, {
        method: 'PUT',
        body: JSON.stringify(documentJSON),
        headers: new Headers({
            'Content-Type': 'application/json'
          })
    });
    alert("Document Saved Successfully")
}