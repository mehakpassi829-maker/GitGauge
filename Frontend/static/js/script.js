async function analyzeUser() {
    const username = document.getElementById("username").value;
    const resultDiv = document.getElementById("result");

    if (!username) {
        resultDiv.innerHTML = "Please enter a username.";
        return;
    }

    resultDiv.innerHTML = "Loading...";

    try {
        const response = await fetch(`http://127.0.0.1:8000/analyze/${username}`);
        const data = await response.json();

        resultDiv.innerHTML = `
            <h3>Username: ${data.username}</h3>
            <p>Total Repos: ${data.repo_count}</p>
        `;
    } catch (error) {
        resultDiv.innerHTML = "Error fetching data.";
        console.error(error);
    }
}