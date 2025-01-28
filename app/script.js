const apiUrl = window.config.apiUrl;

document.getElementById('messageForm').addEventListener('submit', function (event) {
    event.preventDefault();

    // Show loader
    const loader = document.createElement('div');
    loader.className = 'loader'; // Add a class for styling
    loader.innerText = 'Loading...';
    document.getElementById('response').innerHTML = ''; // Clear previous responses
    document.getElementById('response').appendChild(loader);

    const user = document.getElementById('user').value;
    const message = document.getElementById('message').value;

    // Send data to OpenSearch
    fetch(`${apiUrl}/messages/_doc`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user: user,
            message: message,
            timestamp: new Date().toISOString() // Use ISO format for timestamp
        })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('response').innerHTML = `<div class="alert alert-success">Message stored successfully!</div>`;
            document.getElementById('messageForm').reset(); // Clear the form
            loadMessages();
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('response').innerHTML = `<div class="alert alert-danger">Error storing message!</div>`;
        });
});



// Function to load messages from OpenSearch
function loadMessages() {
    const timeline = document.getElementById('messageTimeline');
    timeline.innerHTML = '<li class="list-group-item text-muted">Loading messages...</li>'; // Add loading message

    fetch(`${apiUrl}/messages/_search`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(response => response.json())
        .then(data => {
            timeline.innerHTML = ''; // Clear existing messages

            if (data.hits.total.value === 0) {
                const placeholderItem = document.createElement('li');
                placeholderItem.className = 'list-group-item text-muted';
                placeholderItem.innerText = 'No messages yet. Be the first to send a message!';
                timeline.appendChild(placeholderItem);
            } else {
                // Sort messages by timestamp in descending order
                const sortedMessages = data.hits.hits.sort((a, b) => new Date(b._source.timestamp) - new Date(a._source.timestamp));

                sortedMessages.forEach(hit => {
                    const messageItem = document.createElement('li');
                    messageItem.className = 'list-group-item';
                    messageItem.innerHTML = `<strong>${hit._source.user}</strong>: ${hit._source.message} <br><small>${new Date(hit._source.timestamp).toLocaleString()}</small>`;
                    timeline.appendChild(messageItem);
                });
            }
        })
        .catch(error => {
            console.error('Error loading messages:', error);
        });
}


window.onload = function () {
    loadMessages(); // Load messages when the page loads

    // Set an interval to reload messages every 5 seconds
    setInterval(loadMessages, 5000);
};