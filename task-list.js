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

  // Create a new task object
  const task = {};

  // Store each objective and points as individual fields in the task object
  for (let i = 0; i < objectiveInputs.length; i++) {
    const objective = objectiveInputs[i].value;
    const points = parseInt(pointsInputs[i].value);
    task[objective] = points;
  }

  // Add the task to the Firestore collection with the subject as the document name
  firestore.collection('tasks').doc(subject).set(task)
    .then(() => {
      // Reset the form
      document.getElementById('taskForm').reset();
      console.log('Task added successfully!');
    })
    .catch((error) => {
      console.error('Error adding task:', error);
    });
}

// Function to retrieve and render tasks
function retrieveTasks() {
  const tasksContainer = document.getElementById('tasksContainer');
  tasksContainer.innerHTML = '';

  firestore.collection('tasks')
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const task = doc.data();
        const taskCard = document.createElement('div');
        taskCard.classList.add('task-card');
        taskCard.innerHTML = `
          <h3>Quest</h3>
          <p>Subject: ${doc.id}</p>
          ${Object.entries(task).map(([objective, points]) => `
            <div>
              <p>${objective}: ${points} XP</p>
              <button type="button" onclick="completeObjective('${doc.id}', '${objective}')">All set!</button>
            </div>
          `).join('')}
        `;
        tasksContainer.appendChild(taskCard);
      });
    })
    .catch((error) => {
      console.error('Error retrieving tasks:', error);
    });
}

// Function to mark objective as complete
function completeObjective(taskId, objective) {
  firestore
    .collection('tasks')
    .doc(taskId)
    .get()
    .then((doc) => {
      if (doc.exists) {
        const task = doc.data();

        // Check if the objective exists in the task
        if (!task.hasOwnProperty(objective)) {
          console.log('Objective not found.');
          return;
        }

        const subject = doc.id;
        const completedObjective = {
          objective,
          points: task[objective]
        };

        const completedTask = {
          subject,
          objectives: [completedObjective]
        };

        // Update user's points
        updatePoints(task[objective])
          .then(() => {
            firestore
              .collection('completedTasks')
              .add(completedTask)
              .then(() => {
                console.log('Task moved to completed tasks successfully!');
                firestore
                  .collection('tasks')
                  .doc(taskId)
                  .update({
                    [objective]: firebase.firestore.FieldValue.delete(),
                  })
                  .then(() => {
                    console.log('Objective marked as complete successfully!');
                    retrieveTasks();
                    retrieveCompletedTasks();
                  })
                  .catch((error) => {
                    console.error('Error marking objective as complete:', error);
                  });
              })
              .catch((error) => {
                console.error('Error moving task to completed tasks:', error);
              });
          })
          .catch((error) => {
            console.error('Error updating points:', error);
          });
      } else {
        console.log('Task does not exist.');
      }
    })
    .catch((error) => {
      console.error('Error retrieving task:', error);
    });
}
function retrieveCompletedTasks() {
  const completedTasksContainer = document.getElementById('completedTasksContainer');
  completedTasksContainer.innerHTML = '';

  firestore
    .collection('completedTasks')
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const completedTask = doc.data();
        const completedTaskCard = document.createElement('div');
        completedTaskCard.classList.add('completed-task-card');
        completedTaskCard.innerHTML = `
          <h3>Completed Task</h3>
          <p>Subject: ${completedTask.subject}</p>
          ${completedTask.objectives.length > 0
            ? `
              <ul>
                ${completedTask.objectives
                  .map((objective) => `<li>${objective.objective} - ${objective.points} points</li>`)
                  .join('')}
              </ul>
            `
            : '<p>No objectives found.</p>'
          }
        `;
        completedTasksContainer.appendChild(completedTaskCard);
      });
    })
    .catch((error) => {
      console.error('Error retrieving completed tasks:', error);
    });
}



// Function to update user's points
// Function to update user's points
function updatePoints(points) {
  // Assuming you have a collection named "users" where user information is stored
  const userId = 'axelotl'; // Replace 'user_id' with the actual user ID

  return firestore
    .collection('users')
    .doc(userId)
    .get()
    .then((doc) => {
      if (doc.exists) {
        const user = doc.data();
        const currentPoints = user.points || 0; // Retrieve current points or default to 0
        const updatedPoints = currentPoints + Number(points); // Convert points to number

        // Update user's points in the Firestore document
        return firestore
          .collection('users')
          .doc(userId)
          .update({ points: updatedPoints });
      } else {
        console.log('User does not exist.');
        return Promise.reject('User does not exist.');
      }
    })
    .catch((error) => {
      console.error('Error updating user points:', error);
      return Promise.reject(error);
    });
}


// Call the function to retrieve and render tasks
retrieveTasks();
retrieveCompletedTasks();
