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
const userId = "axelotl"
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const firestore = firebase.firestore();

// Retrieve user's available points
function retrievePoints() {
  const userId = 'axelotl'; // Replace 'user_id' with the actual user ID

  firestore.collection('users').doc(userId).get()
    .then((doc) => {
      if (doc.exists) {
        const user = doc.data();
        const points = user.points || 0;
        document.getElementById('points').textContent = points;
      } else {
        console.log('User does not exist.');
      }
    })
    .catch((error) => {
      console.error('Error retrieving user points:', error);
    });
}

// Call the retrievePoints function when the page loads
document.addEventListener('DOMContentLoaded', () => {
  retrievePoints();
});
// Retrieve available rewards
function retrieveRewards() {
  const rewardsContainer = document.getElementById('rewardsContainer');
  rewardsContainer.innerHTML = '';

  firestore.collection('rewards')
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const reward = doc.data();
        const rewardCard = document.createElement('div');
        rewardCard.classList.add('reward-card');
        rewardCard.innerHTML = `
          <h3>${reward.name}</h3>
          <p>Points: ${reward.points}</p>
          <button type="button" onclick="redeemReward('${doc.id}', '${reward.name}', ${reward.points})">Redeem</button>
        `;
        rewardsContainer.appendChild(rewardCard);
      });
    })
    .catch((error) => {
      console.error('Error retrieving rewards:', error);
    });
}

// Call the retrieveRewards function when the page loads
document.addEventListener('DOMContentLoaded', () => {
  retrieveRewards();
});

// Redeem a reward
function redeemReward(rewardId, rewardName, rewardPoints) {
  const userId = 'axelotl'; // Replace 'user_id' with the actual user ID

  firestore.collection('users').doc(userId).get()
    .then((doc) => {
      if (doc.exists) {
        const user = doc.data();
        const userPoints = user.points || 0;

        if (userPoints >= rewardPoints) {
          // Deduct points from the user's balance
          const updatedPoints = userPoints - rewardPoints;
          firestore.collection('users').doc(userId).update({ points: updatedPoints })
            .then(() => {
              console.log('Points deducted successfully.');

              // Add the redeemed reward to the user's redeemed rewards list
              firestore.collection('users').doc(userId).collection('redeemedRewards').doc(rewardId).set({ name: rewardName, points: rewardPoints })
                .then(() => {
                  console.log('Reward redeemed successfully.');
                  retrievePoints();
                  retrieveRedeemedRewards();
                })
                .catch((error) => {
                  console.error('Error adding redeemed reward:', error);
                });
            })
            .catch((error) => {
              console.error('Error deducting points:', error);
            });
        } else {
          console.log('Insufficient points.');
        }
      } else {
        console.log('User does not exist.');
      }
    })
    .catch((error) => {
      console.error('Error retrieving user:', error);
    });
}

// Retrieve user's redeemed rewards
function retrieveRedeemedRewards() {
  const redeemedRewardsContainer = document.getElementById('redeemedRewardsContainer');
  redeemedRewardsContainer.innerHTML = '';

  firestore.collection('users').doc(userId).collection('redeemedRewards')
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const redeemedReward = doc.data();
        const redeemedRewardCard = document.createElement('div');
        redeemedRewardCard.classList.add('redeemed-reward-card');
        redeemedRewardCard.innerHTML = `
          <h3>${redeemedReward.name}</h3>
          <p>Points: ${redeemedReward.points}</p>
        `;
        redeemedRewardsContainer.appendChild(redeemedRewardCard);
      });
    })
    .catch((error) => {
      console.error('Error retrieving redeemed rewards:', error);
    });
}

// Call the retrieveRedeemedRewards function when the page loads
document.addEventListener('DOMContentLoaded', () => {
  retrieveRedeemedRewards();
});

function handleFormSubmit() {

  // Get the reward name and points from the form
  const rewardName = document.getElementById('rewardName').value;
  const rewardPoints = parseInt(document.getElementById('rewardPoints').value);

  // Create a new reward object
  const reward = {
    name: rewardName,
    points: rewardPoints,
  };

  // Add the reward to the Firestore collection
  firestore.collection('rewards').add(reward)
    .then(() => {
      // Reset the form
      document.getElementById('rewardForm').reset();
      console.log('Reward added successfully!');
      retrieveRewards(); // Retrieve and update the rewards on the page
    })
    .catch((error) => {
      console.error('Error adding reward:', error);
    });
}
