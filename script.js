const agentsData = [
    { id: "kta", name: "Knowledge Transformation Agent", abbr: "KTA", color: "sky", role: "Ingests unstructured/structured source materials (Jira, PRDs, financial reports).", logic: "Determines core value proposition, extracts key entities, and generates structured Content Briefs JSONs.", tools: "Document parsers, OCR, RAG against historical content." },
    { id: "cca", name: "Content Creation Agent", abbr: "CCA", color: "indigo", role: "Drafts channel-specific copy (SEO blog, tweet, LinkedIn) based on KTA briefs.", logic: "Selects prompt templates and few-shot examples based on target channel and audience persona.", tools: "Gemini 1.5 Flash, Prompt Registry." },
    { id: "cra", name: "Compliance Review Agent", abbr: "CRA", color: "emerald", role: "Enforces brand governance, terminology, and regulatory constraints.", logic: "Multi-pass validation: Brand Voice, Terminology exact-match, Regulatory rules. Outputs Pass/Fail with inline fixes.", tools: "Gemini 1.5 Pro, Enterprise Knowledge Graph." },
    { id: "la", name: "Localization Agent", abbr: "LA", color: "amber", role: "Translates and culturally adapts approved baseline content for target regions.", logic: "Identifies idioms for cultural rewrite. Adapts date, currency, and metric formats. Handles length limits.", tools: "Translation memory, Locale rule engine." },
    { id: "da", name: "Distribution Agent", abbr: "DA", color: "violet", role: "Formats and pushes finalized, approved content to downstream CMS/Social.", logic: "Formats payloads for API requirements (HTML, JSON). Handles scheduling, rate-limiting, and circuit breaking.", tools: "WordPress API, AEM GraphQL, Hootsuite API." },
    { id: "ia", name: "Intelligence Agent", abbr: "IA", color: "rose", role: "Closes the loop by analyzing post-publication performance metrics.", logic: "Ingests CTR, bounce rates. Correlates with content metadata. Updates RAG database to refine future CCA prompts.", tools: "GA4 API, Social Telemetry." }
];

const workflowData = [
    { id: "p1", type: "phase", title: "Phase 1: Ingestion & Briefing", trigger: "User uploads source / Webhook", action: "KTA generates structured brief.", agent: "KTA" },
    { id: "p2", type: "phase", title: "Phase 2: Drafting & Auto-Correction", trigger: "Brief completed", action: "CCA generates draft. Fast-loop with CRA for auto-rewrites (Max 3).", agent: "CCA ⇄ CRA" },
    { id: "g1", type: "gate", title: "Gate 1: Post-Draft Approval", actor: "Human Content Editor", action: "Workflow pauses. Human reviews draft via deep link. Approve, Edit, or Reject.", alert: true },
    { id: "p3", type: "phase", title: "Phase 3: Localization", trigger: "Gate 1 Approved", action: "LA generates regional variants of master draft.", agent: "LA" },
    { id: "g2", type: "gate", title: "Gate 2: Post-Compliance & Loc.", actor: "Human Legal/Regional Manager", action: "Regional review. Legal reviews heavily regulated claims flagged by CRA.", alert: true },
    { id: "p4", type: "phase", title: "Phase 4: Staging & Sign-Off", trigger: "Gate 2 Approved", action: "DA stages content in target CMS in draft mode.", agent: "DA" },
    { id: "g3", type: "gate", title: "Gate 3: Pre-Publication", actor: "Human Publisher/Marketing Lead", action: "Final visual review in CMS/Social tool. One-click publish approval.", alert: true },
    { id: "p5", type: "phase", title: "Phase 5: Publication & Telemetry", trigger: "Gate 3 Approved", action: "DA executes publish. IA begins monitoring 24hrs post-publish.", agent: "DA → IA" }
];

function renderAgents() {
    const container = document.getElementById('agent-grid');
    agentsData.forEach(agent => {
        const card = document.createElement('div');
        card.className = `bg-white border border-stone-200 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1 group`;
        card.onclick = () => toggleAgentDetail(card, agent);

        card.innerHTML = `
                    <div class="flex items-center justify-between mb-4">
                        <div class="bg-${agent.color}-100 text-${agent.color}-700 font-bold text-xl px-3 py-2 rounded-lg">${agent.abbr}</div>
                        <div class="text-stone-400 group-hover:text-sky-500 transition-colors">⊞</div>
                    </div>
                    <h3 class="font-bold text-lg text-stone-900 mb-2">${agent.name}</h3>
                    <p class="text-stone-600 text-sm mb-4 line-clamp-2">${agent.role}</p>
                    <div class="hidden detail-content mt-4 pt-4 border-t border-stone-100 fade-in">
                        <div class="mb-3">
                            <span class="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-1">Decision Logic</span>
                            <p class="text-sm text-stone-700">${agent.logic}</p>
                        </div>
                        <div>
                            <span class="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-1">Tools & Integrations</span>
                            <p class="text-sm text-stone-700 font-mono bg-stone-50 p-2 rounded">${agent.tools}</p>
                        </div>
                    </div>
                `;
        container.appendChild(card);
    });
}

function toggleAgentDetail(cardElement, agentInfo) {
    const detailSection = cardElement.querySelector('.detail-content');
    const allDetails = document.querySelectorAll('.detail-content');

    allDetails.forEach(el => {
        if (el !== detailSection && !el.classList.contains('hidden')) {
            el.classList.add('hidden');
            el.parentElement.classList.remove('ring-2', `ring-${agentInfo.color}-400`);
        }
    });

    if (detailSection.classList.contains('hidden')) {
        detailSection.classList.remove('hidden');
        cardElement.classList.add('ring-2', `ring-${agentInfo.color}-400`);
    } else {
        detailSection.classList.add('hidden');
        cardElement.classList.remove('ring-2', `ring-${agentInfo.color}-400`);
    }
}

function renderWorkflow() {
    const container = document.getElementById('timeline-container');
    const panel = document.getElementById('workflow-detail-panel');

    workflowData.forEach((step, index) => {
        const item = document.createElement('div');
        item.className = `relative pl-8 py-3 cursor-pointer group mb-1 rounded-r-lg transition-colors tab-inactive`;
        item.id = `step-tab-${index}`;

        const dotColor = step.type === 'gate' ? 'bg-amber-500' : 'bg-sky-500';
        const icon = step.type === 'gate' ? '⚑' : '⚙';

        item.innerHTML = `
                    <div class="absolute left-[1.1rem] top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-4 border-white ${dotColor} z-10 shadow-sm group-hover:scale-125 transition-transform"></div>
                    <div class="text-sm font-bold text-stone-800 flex items-center gap-2">
                        <span class="${step.type === 'gate' ? 'text-amber-600' : 'text-sky-600'}">${icon}</span>
                        ${step.title}
                    </div>
                `;

        item.onclick = () => {
            document.querySelectorAll('[id^="step-tab-"]').forEach(el => {
                el.classList.remove('tab-active');
                el.classList.add('tab-inactive');
            });
            item.classList.remove('tab-inactive');
            item.classList.add('tab-active');

            let panelContent = '';
            if (step.type === 'phase') {
                panelContent = `
                            <div class="fade-in h-full flex flex-col justify-center">
                                <div class="inline-block bg-sky-100 text-sky-800 px-3 py-1 rounded-full text-xs font-bold uppercase w-max mb-4">Automated Phase</div>
                                <h3 class="text-2xl font-bold text-stone-900 mb-4">${step.title}</h3>
                                <div class="space-y-4">
                                    <div class="bg-stone-50 p-4 rounded-lg border border-stone-200">
                                        <span class="block text-xs font-bold text-stone-400 uppercase mb-1">Trigger</span>
                                        <p class="text-stone-800">${step.trigger}</p>
                                    </div>
                                    <div class="bg-stone-50 p-4 rounded-lg border border-stone-200">
                                        <span class="block text-xs font-bold text-stone-400 uppercase mb-1">Action Engine</span>
                                        <p class="text-stone-800">${step.action}</p>
                                    </div>
                                    <div class="bg-sky-50 p-4 rounded-lg border border-sky-100 flex items-center gap-3">
                                        <div class="bg-sky-600 text-white font-bold px-2 py-1 rounded text-sm">${step.agent}</div>
                                        <span class="text-sm text-sky-800 font-medium">Active Agent(s) in this phase</span>
                                    </div>
                                </div>
                            </div>
                        `;
            } else {
                panelContent = `
                            <div class="fade-in h-full flex flex-col justify-center border-l-4 border-amber-500 pl-6">
                                <div class="inline-block bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold uppercase w-max mb-4 flex items-center gap-2"><span>⚑</span> Human-in-the-Loop Gate</div>
                                <h3 class="text-2xl font-bold text-stone-900 mb-2">${step.title}</h3>
                                <p class="text-amber-600 font-medium mb-6 flex items-center gap-2">👤 Required Actor: ${step.actor}</p>
                                <div class="bg-white p-5 rounded-lg border border-amber-200 shadow-sm relative overflow-hidden">
                                    <div class="absolute right-0 top-0 bottom-0 w-2 bg-amber-400"></div>
                                    <span class="block text-xs font-bold text-stone-400 uppercase mb-2">Gate State & Action</span>
                                    <p class="text-stone-800 text-lg leading-relaxed">${step.action}</p>
                                </div>
                                <p class="text-xs text-stone-400 mt-4 italic">Note: DAG state machine pauses execution completely until human input is received via integrated API webhooks.</p>
                            </div>
                        `;
            }
            panel.innerHTML = panelContent;
        };
        container.appendChild(item);
    });
}

function initCharts() {
    Chart.defaults.font.family = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    Chart.defaults.color = '#78716c';

    const ctxCct = document.getElementById('cctChart').getContext('2d');
    new Chart(ctxCct, {
        type: 'bar',
        data: {
            labels: ['Manual Workflow', 'Tech Flow Automated'],
            datasets: [{
                label: 'Days to Publish',
                data: [14, 2],
                backgroundColor: ['#d6d3d1', '#0ea5e9'],
                borderRadius: 6,
                barPercentage: 0.6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (c) { return c.raw + ' Days'; } } } },
            scales: { y: { beginAtZero: true, grid: { color: '#f5f5f4' } }, x: { grid: { display: false } } }
        }
    });

    const ctxFpy = document.getElementById('fpyChart').getContext('2d');
    new Chart(ctxFpy, {
        type: 'doughnut',
        data: {
            labels: ['First-Pass Yield (Success)', 'Auto-Rewrites Needed'],
            datasets: [{
                data: [85, 15],
                backgroundColor: ['#10b981', '#fecdd3'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: {
                legend: { position: 'bottom' },
                tooltip: { callbacks: { label: function (c) { return c.raw + '%'; } } }
            }
        },
        plugins: [{
            id: 'textCenter',
            beforeDraw: function (chart) {
                var width = chart.width, height = chart.height, ctx = chart.ctx;
                ctx.restore();
                var fontSize = (height / 114).toFixed(2);
                ctx.font = "bold " + fontSize + "em sans-serif";
                ctx.textBaseline = "middle";
                ctx.fillStyle = "#10b981";
                var text = ">85%", textX = Math.round((width - ctx.measureText(text).width) / 2), textY = height / 2.2;
                ctx.fillText(text, textX, textY);
                ctx.font = (fontSize * 0.4) + "em sans-serif";
                ctx.fillStyle = "#78716c";
                var text2 = "Target Goal", text2X = Math.round((width - ctx.measureText(text2).width) / 2), text2Y = height / 2.2 + 25;
                ctx.fillText(text2, text2X, text2Y);
                ctx.save();
            }
        }]
    });

    const ctxHtt = document.getElementById('httChart').getContext('2d');
    new Chart(ctxHtt, {
        type: 'bar',
        data: {
            labels: ['Baseline Touch Time', 'Tech Flow Target'],
            datasets: [{
                label: 'Relative Human Effort (%)',
                data: [100, 25],
                backgroundColor: ['#a8a29e', '#10b981'],
                borderRadius: 6,
                barPercentage: 0.5
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (c) { return c.raw + '% of original effort'; } } } },
            scales: { x: { beginAtZero: true, max: 100, grid: { color: '#f5f5f4' } }, y: { grid: { display: false } } }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Handle Splash Screen Removal
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        splash.classList.add('splash-hidden');
        setTimeout(() => {
            splash.style.display = 'none';
        }, 600); // Wait for transition to finish
    }, 1800); // Display splash for 1.8 seconds

    renderAgents();
    renderWorkflow();
    initCharts();

    // Auto-select first timeline item
    const firstTab = document.getElementById('step-tab-0');
    if (firstTab) firstTab.click();
});