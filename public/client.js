// client-side js
// run by the browser each time your view template is loaded

console.log("hello world :o");

// define variables that reference elements on our page
const santaForm = document.forms[0];

// listen for the form to be submitted and add a new dream when it is
santaForm.onsubmit = function (event) {
  // TODO: check the text isn't more than 100chars before submitting
  event.preventDefault();
  const userid = document.getElementById('userid').value;
  const wish = document.getElementById('wish').value;
  if (wish.length > 100) {
  alert("Wish should not be more than 100 characters");
  } else {
  // submit form data to the server
  event.currentTarget.submit();
  }
};
