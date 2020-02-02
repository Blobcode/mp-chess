document.addEventListener("DOMContentLoaded", event => {
    //set up firebase
    const app = firebase.app();
    db = firebase.firestore();
})


function generateGame() {
    db.collection("games").add({
        fen: ""
    })
        .then(function (docRef) {
            window.location.href = '/game/?gameid=' + docRef.id + '&c=w'
        })
        .catch(function (error) {
            console.error("Error adding document: ", error);
        });

}