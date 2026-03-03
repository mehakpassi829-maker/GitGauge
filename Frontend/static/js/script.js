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

        // Hireability Score (Demo)
        const hireScore = data.hireability_score;
        drawScore(hireScore);

        // Intelligence Scores (Demo)
        const commit = data.commit_analysis;
        console.log("Commit Analysis:", commit);
        const tech = Math.floor(Math.random() * 30) + 60;
        const project = Math.floor(Math.random() * 30) + 60;
        const doc = Math.floor(Math.random() * 30) + 60;
        const growth = Math.floor(Math.random() * 30) + 60;

        document.getElementById("commitScore").innerText = commit.commit_score + "%";
        document.getElementById("techScore").innerText = tech + "%";
        document.getElementById("projectScore").innerText = project + "%";
        document.getElementById("docScore").innerText = doc + "%";
        document.getElementById("growthScore").innerText = growth + "%";

        generateRadar(commit, tech, project, doc, growth);
        generateInsights(commit, tech, project, doc, growth);

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
        alert("Error fetching data");
        console.error(error);
    }
}

function drawScore(score) {
    const canvas = document.getElementById("scoreCanvas");
    const ctx = canvas.getContext("2d");
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 70;

    let color = score < 50 ? "#ef4444" : score < 75 ? "#f59e0b" : "#10b981";
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

function generateRadar(c,t,p,d,g) {
    const ctx = document.getElementById('radarChart');

    if (radarChartInstance) radarChartInstance.destroy();

    radarChartInstance = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Commit','Tech','Project','Docs','Growth'],
            datasets: [{
                label: 'Skill Profile',
                data: [c,t,p,d,g],
                backgroundColor: 'rgba(59,130,246,0.2)',
                borderColor: '#3b82f6'
            }]
        },
        options: {
            scales: {
                r: { min: 0, max: 100 }
            }
        }
    });
}

function generateInsights(c,t,p,d,g) {
    const strengths = [];
    const weaknesses = [];
    const scores = {Commit:c, Tech:t, Project:p, Docs:d, Growth:g};

    for (let key in scores) {
        if (scores[key] > 80) strengths.push(key);
        if (scores[key] < 65) weaknesses.push(key);
    }

    document.getElementById("strengths").innerHTML =
        "<h3>Strengths:</h3> " + (strengths.length ? strengths.join(", ") : "None");

    document.getElementById("weaknesses").innerHTML =
        "<h3>Weaknesses:</h3> " + (weaknesses.length ? weaknesses.join(", ") : "None");
}