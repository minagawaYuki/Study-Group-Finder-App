const token = localStorage.getItem('token');
        const apiBaseUrl = 'https://localhost:7034/api/user/studygoals';

        const goalDescription = document.getElementById('goalDescription');
        const addGoalBtn = document.getElementById('addGoalBtn');
        const openGoalsList = document.getElementById('openGoalsList');
        const completedGoalsList = document.getElementById('completedGoalsList');
        const openGoalsCount = document.getElementById('openGoalsCount');
        const completedGoalsCount = document.getElementById('completedGoalsCount');

        // Fetch and display goals
        fetchGoals();

        addGoalBtn.addEventListener('click', addGoal);
        goalDescription.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addGoal();
        });

        // Tab switching
        document.querySelectorAll('.goals-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.goals-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                document.querySelectorAll('.goals-list').forEach(list => list.classList.remove('active'));
                document.getElementById(`${tab.dataset.tab}GoalsList`).classList.add('active');
            });
        });

        async function addGoal() {
            if (!goalDescription.value.trim()) return;

            const goal = { description: goalDescription.value };
            const response = await fetch(apiBaseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(goal)
            });

            if (response.ok) {
                fetchGoals();
                goalDescription.value = '';
            } else {
                alert('Failed to add goal.');
            }
        }

        async function fetchGoals() {
            const response = await fetch(apiBaseUrl, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const goals = await response.json();
                updateGoalLists(goals);
            } else {
                alert('Failed to fetch goals.');
            }
        }

        function updateGoalLists(goals) {
            openGoalsList.innerHTML = '';
            completedGoalsList.innerHTML = '';
            let openCount = 0;
            let completedCount = 0;

            goals.forEach((goal) => {
                const goalElement = document.createElement('div');
                goalElement.className = 'goal-item';
                goalElement.innerHTML = `
                    <span class="goal-description">${goal.Description}</span>
                    <div class="goal-actions">
                        ${!goal.IsCompleted ? `
                            <button onclick="markAsCompleted(${goal.Id})" title="Mark as completed">Completed</button>
                            <button class="delete" onclick="deleteGoal(${goal.Id})" title="Delete goal">×</button>
                        ` : `
                            <button class="delete" onclick="deleteGoal(${goal.Id})" title="Delete goal">×</button>
                        `}
                    </div>
                `;

                if (!goal.IsCompleted) {
                    openGoalsList.appendChild(goalElement);
                    openCount++;
                } else {
                    completedGoalsList.appendChild(goalElement);
                    completedCount++;
                }
            });

            openGoalsCount.textContent = openCount;
            completedGoalsCount.textContent = completedCount;
        }

        async function markAsCompleted(id) {
            const response = await fetch(`${apiBaseUrl}/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(true)
            });

            if (response.ok) {
                fetchGoals();
            } else {
                alert('Failed to mark goal as completed.');
            }
        }

        async function deleteGoal(id) {
            const response = await fetch(`${apiBaseUrl}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                fetchGoals();
            } else {
                alert('Failed to delete goal.');
            }
        }