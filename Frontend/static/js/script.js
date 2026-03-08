let recruiterMode = false;
let radarChartInstance = null;

function toggleMode() {
    recruiterMode = !recruiterMode;
    alert(recruiterMode ? "Recruiter Mode ON" : "Developer Mode ON");
}

async function analyzeUser() {

    const username = document.getElementById("username").value;
    const resultDiv = document.getElementById("result");
    const userInfo = document.getElementById("userInfo");

    if (!username) {
        alert("Enter username");
        return;
    }

    try {

        const response = await fetch(`http://127.0.0.1:8000/analyze/${username}`);
        const data = await response.json();

        console.log("API Response:", data);

        // Hireability Score
        const hireScore = data.hireability_score;
        drawScore(hireScore);

        // Scores
        const commit = data.commit_analysis;
        const engineering = data.engineering_analysis;

        const commitScore = commit.commit_score;
        const engineeringScore = engineering.engineering_score;
        const collaborationScore = engineering.collaboration_score;

        // Temporary demo values
        const docScore = Math.floor(Math.random() * 30) + 60;
        const growthScore = Math.floor(Math.random() * 30) + 60;

        // Update UI
        document.getElementById("commitScore").innerText = commitScore + "%";
        document.getElementById("archScore").innerText = engineeringScore + "%";
        document.getElementById("collaboration_score").innerText = collaborationScore + "%";
        document.getElementById("docScore").innerText = docScore + "%";
        document.getElementById("growthScore").innerText = growthScore + "%";

        generateRadar(
            commitScore,
            engineeringScore,
            collaborationScore,
            docScore,
            growthScore
        );

        generateInsights(
            commitScore,
            engineeringScore,
            collaborationScore,
            docScore,
            growthScore
        );

        // Repo List
        let reposList = "";

        if (data.repos && data.repos.length > 0) {

            reposList = "<ul>";

            data.repos.forEach(repo => {

                reposList += `
                    <li>
                        <a href="${repo.url}" target="_blank">
                            ${repo.name}
                        </a>
                    </li>
                `;

            });

            reposList += "</ul>";

        } else {

            reposList = "<p>No repositories found.</p>";

        }

        userInfo.innerHTML = `
            <h2>${data.username}</h2>
            <p><strong>Total Repositories:</strong> ${data.repo_count}</p>
            <h3>Repositories:</h3>
            ${reposList}
        `;

        resultDiv.classList.remove("hidden");

    } catch (error) {

        console.error("API error:", error);
        alert("Failed to analyze user. Check backend server.");

    }
}

function drawScore(score) {

    const canvas = document.getElementById("scoreCanvas");
    const ctx = canvas.getContext("2d");

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 70;

    let color =
        score < 50 ? "#ef4444"
        : score < 75 ? "#f59e0b"
        : "#10b981";

    let current = 0;

    function animate() {

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = "#334155";
        ctx.lineWidth = 10;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, -Math.PI/2,
            (-Math.PI/2)+(2*Math.PI*current/100));
        ctx.strokeStyle = color;
        ctx.lineWidth = 10;
        ctx.stroke();

        ctx.fillStyle = "white";
        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(current+"%", centerX, centerY);

        if (current < score) {
            current++;
            requestAnimationFrame(animate);
        }

    }

    animate();
}


function generateRadar(commit, engineering, collaboration, docs, growth) {

    const canvas = document.getElementById("radarChart");

    // reset canvas size
    canvas.width = 400;
    canvas.height = 400;

    const ctx = canvas.getContext("2d");

    if (radarChartInstance) {
        radarChartInstance.destroy();
        radarChartInstance = null;
    }

    radarChartInstance = new Chart(ctx, {

        type: "radar",

        data: {
            labels: [
                "Commit",
                "Engineering",
                "Collaboration",
                "Docs",
                "Growth"
            ],

            datasets: [{
                label: "Skill Profile",
                data: [
                    commit,
                    engineering,
                    collaboration,
                    docs,
                    growth
                ],
                backgroundColor: "rgba(59,130,246,0.2)",
                borderColor: "#3b82f6",
                borderWidth: 2
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    min: 0,
                    max: 100,
                    ticks: {
                        stepSize: 20
                    }
                }
            }
        }

    });

}

function generateInsights(commit, engineering, collaboration, docs, growth) {

    const strengths = [];
    const weaknesses = [];

    const scores = {
        Commit: commit,
        Engineering: engineering,
        Collaboration: collaboration,
        Docs: docs,
        Growth: growth
    };

    for (let key in scores) {

        if (scores[key] > 80) {
            strengths.push(key);
        }

        if (scores[key] < 65) {
            weaknesses.push(key);
        }

    }

    document.getElementById("strengths").innerHTML =
        "<h3>Strengths:</h3> " +
        (strengths.length ? strengths.join(", ") : "None");

    document.getElementById("weaknesses").innerHTML =
        "<h3>Weaknesses:</h3> " +
        (weaknesses.length ? weaknesses.join(", ") : "None");

}