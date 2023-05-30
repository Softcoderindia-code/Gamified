// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAT3E1EmAHOTjklTcF0QCkC7lIkeZH4agw",
  authDomain: "axelotlstudy.firebaseapp.com",
  databaseURL: "https://axelotlstudy-default-rtdb.firebaseio.com",
  projectId: "axelotlstudy",
  storageBucket: "axelotlstudy.appspot.com",
  messagingSenderId: "1046146296939",
  appId: "1:1046146296939:web:2acfb5fcf9488cd062552e",
  measurementId: "G-C90D5FGMQZ"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const firestore = firebase.firestore();

// Function to handle form submission
function handleFormSubmit(event) {
  event.preventDefault();

  // Get the subject from the form
  const subject = document.getElementById('subject').value;

  // Get all the objective inputs
  const objectiveInputs = document.querySelectorAll('.objective input[name="objective[]"]');
  const pointsInputs = document.querySelectorAll('.objective input[name="points[]"]');

  // Create an object to hold the objectives and points
  const objectives = {};

  // Retrieve the existing task or create a new one
  firestore
    .collection('tasks')
    .doc(subject)
    .get()
    .then((doc) => {
      if (doc.exists) {
        // Retrieve the existing objectives if the task exists
        const existingObjectives = doc.data();

        // Merge the existing objectives with the new ones
        Object.assign(objectives, existingObjectives);
      }

      // Store each new objective and points as individual fields in the objectives object
      for (let i = 0; i < objectiveInputs.length; i++) {
        const objective = objectiveInputs[i].value;
        const points = parseInt(pointsInputs[i].value);
        objectives[objective] = points;
      }

      // Add or update the task in the Firestore collection with the subject as the document name
      firestore
        .collection('tasks')
        .doc(subject)
        .set(objectives)
        .then(() => {
          // Reset the form
          document.getElementById('taskForm').reset();
          console.log('Task added successfully!');
        })
        .catch((error) => {
          console.error('Error adding task:', error);
        });
    })
    .catch((error) => {
      console.error('Error retrieving task:', error);
    });
}


function addObjective() {
  // Get the objectives container
  const objectivesContainer = document.getElementById('objectivesContainer');

  // Create a new objective container div
  const objectiveContainer = document.createElement('div');
  objectiveContainer.classList.add('objective');

  // Create the objective input element
  const objectiveInput = document.createElement('input');
  objectiveInput.type = 'text';
  objectiveInput.name = 'objective[]';
  objectiveInput.placeholder = 'Objective';
  objectiveInput.required = true;

  // Create the points input element
  const pointsInput = document.createElement('input');
  pointsInput.type = 'number';
  pointsInput.name = 'points[]';
  pointsInput.placeholder = 'Points';
  pointsInput.required = true;

  // Append the objective and points inputs to the objective container
  objectiveContainer.appendChild(objectiveInput);
  objectiveContainer.appendChild(pointsInput);

  // Append the objective container to the objectives container
  objectivesContainer.appendChild(objectiveContainer);
}

// Get the form element
const taskForm = document.getElementById('taskForm');

// Add event listener to handle form submission
taskForm.addEventListener('submit', handleFormSubmit);

// Get the add objective button
const addObjectiveBtn = document.getElementById('addObjectiveBtn');

// Add onclick event listener to the add objective button
addObjectiveBtn.addEventListener('click', addObjective);