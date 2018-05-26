// Initialize Firebase
var config = {
  apiKey: "AIzaSyBQoUB9jUoY2_Xz7tYZFhWrqpSrM5Is9ro",
  authDomain: "fir-group-web-chat-app.firebaseapp.com",
  databaseURL: "https://fir-group-web-chat-app.firebaseio.com",
  projectId: "fir-group-web-chat-app",
  storageBucket: "fir-group-web-chat-app.appspot.com",
  messagingSenderId: "859600669891"
};
var firebase = firebase.initializeApp(config);
var db = firebase.firestore();

// Angular trixo controller
angular.module('trixDemo', ['angularTrix', 'monospaced.elastic']).controller('trixDemoCtrl', function($scope, $timeout) {
 var documentId;
 var html = ''
  /**
   * This gets the initial data from firestore and sets up intial views and values
   */
 $scope.trixInitialize = function(e, editor) {
  trix = e.target;
  toolBar = trix.toolbarElement;
  db.collection("editorHtml").get().then(function(querySnapshot) {
   /**
    * In real application we will get document for user
    */
   let data = {}
   querySnapshot.forEach(function(doc) {
    console.log(doc.id, " => ", doc.data());
    documentId = doc.id
    data = doc.data()
   });
   editor.setSelectedRange([0, 0])
   editor.insertHTML(data.html)

   // Creation of the button
   var b = document.createElement('button');
   b.setAttribute('data-attribute', 'Save');
   b.setAttribute('class', 'save');
   b.setAttribute('type', 'btn');
   b.innerHTML = 'test value';
   saveButton = toolBar.querySelector('.button_group.block_tools').appendChild(b);
   /**
    * This adds event lister to save button 
    * a. saves document in firestore 
    */
   saveButton.addEventListener('click', function() {

    console.log("button clicked")

    let content = document.getElementById("editorContent").innerHTML

    db.collection("editorHtml").doc(documentId).set({
      html: content,
      timestamp: new Date().getTime()
     })
     .then(function(res) {
      console.log("document saved to database: ");
     })
     .catch(function(error) {
      console.error("Error adding document: ", error);
     });
   });
  });
 }

 /**
  * This sections adds real time support for document update 
  * a. It will automtically update the document content if someone else is updating the document
  */
 db.collection("editorHtml")
  .onSnapshot(function(querySnapshot) {
   let updatedHtml = ''
   querySnapshot.forEach(function(doc) {
    console.log("realtime updates", doc.data().html);
    updatedHtml = doc.data().html;
   });
   document.getElementById("output").innerHTML = updatedHtml;
  });

 /**
  * This section adds event listner to keyboard press, works with Ctrl+S keyboard shortcut.
  */
 document.addEventListener("keydown", function(e) {
  if (e.keyCode == 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
   e.preventDefault();

   let content = document.getElementById("editorContent").innerHTML;

   db.collection("editorHtml").doc(documentId).set({
     html: content,
     timestamp: new Date().getTime()
    })
    .then(function(docRef) {
     console.log("Document written with ID: ", docRef);
    })
    .catch(function(error) {
     console.error("Error adding document: ", error);
    });
  }
 }, false);

});