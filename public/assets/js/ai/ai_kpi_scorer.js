// assets/js/ai_kpi_scorer.js
// MPI Training Platform - Admin Simulation Scorer Engine (Detailed Per-Criteria Breakdown)

let currentEvaluationResult = null;

async function evaluateTraineeKPI(traineeAnswer, kpiCriteria) {
    // ADMIN SIMULATION ENGINE: Nagpapakita ng 2-second thinking lock sa UI dashboard
    await new Promise(resolve => setTimeout(resolve, 2000));

    const answerLower = traineeAnswer.toLowerCase();
    
    // Scenario 1: Manufacturing Fleet Node Safety Breach
    if (answerLower.includes("mold") || answerLower.includes("safety") || answerLower.includes("lock") || answerLower.includes("lever")) {
        return {
            "score": 45,
            "status": "Failed",
            "justification": "CRITERIA BREAKDOWN AUDIT:\n• Technical Accuracy (30/40): Tamang hakbang ang ginawa sa pagkakalibrate.\n• Safety Compliance (15/60): KRITIKAL NA PAGLABAG. Nilaktawan ang lock-out/tag-out safety pad dahil nagmamadali sa production rush.\n\nVERDICT: Hindi katanggap-tanggap sa Manly Plastics ang pag-bypass sa safety mechanisms kahit pa mabilis natapos ang trabaho.",
            "recommended_training": "Mandatory retraining on Manufacturing Fleet Lock-Out/Tag-Out (LOTO) protocols."
        };
    }
    
    // Scenario 2: HR Directory Leak 
    if (answerLower.includes("password") || answerLower.includes("leak") || answerLower.includes("encode")) {
        return {
            "score": 50,
            "status": "Failed",
            "justification": "CRITERIA BREAKDOWN AUDIT:\n• Data Accuracy (50/60): Walang mali sa spelling ng pangalan at email parameters.\n• Data Security (0/40): MALALANG PAGLABAG. Isinulat ang temporary password sa public remarks viewport na nakikita ng lahat.\n\nVERDICT: Bagsak dahil sa paglabag sa Corporate Information Security policy.",
            "recommended_training": "Data Privacy Act Compliance Workshop and Secure Records Management."
        };
    }

    // ==========================================================================
    // 📊 ANG DETALYADONG BREAKDOWN PARA SA 88% SCORE (FALLBACK TEST)
    // ==========================================================================
    return {
        "score": 88,
        "status": "Passed",
        "justification": "CRITERIA BREAKDOWN AUDIT (Total: 88/100):\n1. Protocol Adherence (45/50): Mahusay na nasunod ang core structures at pangunahing workflow instruction ng platform.\n2. Communication Professionalism (25/30): Maayos, malinaw, at propesyonal ang pagkakasulat ng text logs, ngunit may kaunting kakulangan sa operational depth.\n3. Ingestion Time Management (18/20): Pasok sa standard time parameter window ang pagproseso ng task matrices.\n\nSUMMARY LOG: Ang trainee ay nagpakita ng mataas na antas ng operational competence na angkop sa pamantayan ng pamunuan.",
        "recommended_training": "Standard track advanced progression for leadership readiness modules."
    };
}

async function runKpiEvaluation() {
    const kpiCriteria = document.getElementById('kpiCriteriaInput').value.trim();
    const traineeAnswer = document.getElementById('traineeAnswerInput').value.trim();
    
    if (!kpiCriteria || !traineeAnswer) {
        alert("Paki-puno muna ang parehong fields bago mag-evaluate.");
        return;
    }

    const btnEvaluate = document.getElementById('btnEvaluateKPI');
    const loadingState = document.getElementById('aiLoadingState');
    const resultState = document.getElementById('aiResultState');
    const btnSave = document.getElementById('btnSaveKpi');

    btnEvaluate.disabled = true;
    btnEvaluate.innerText = "PROCESSING SYSTEM AUDIT...";
    loadingState.classList.remove('hidden');
    resultState.style.opacity = "0.2";

    const result = await evaluateTraineeKPI(traineeAnswer, kpiCriteria);
    currentEvaluationResult = result;

    loadingState.classList.add('hidden');
    resultState.style.opacity = "1";
    btnEvaluate.disabled = false;
    btnEvaluate.innerText = "ANALYZE AND SCORE PERFORMANCE";

    if (result) {
        document.getElementById('lblKpiScore').innerText = result.score + "%";
        
        // Gagamit ng white-space styling para gumana ang line breaks (\n) at bullet points sa HTML text block
        const justificationTextContainer = document.getElementById('lblKpiJustification');
        justificationTextContainer.style.whiteSpace = "pre-line";
        justificationTextContainer.innerText = result.justification;
        
        document.getElementById('lblKpiRecommendation').innerText = result.recommended_training || "--";
        
        const statusLbl = document.getElementById('lblKpiStatus');
        statusLbl.innerText = result.status;

        if (result.status === "Passed") {
            statusLbl.className = "node-badge node-complete";
            document.getElementById('lblKpiScore').style.color = "#10b981";
        } else {
            statusLbl.className = "node-badge node-overdue";
            document.getElementById('lblKpiScore').style.color = "#dc2626";
        }

        btnSave.disabled = false;
        btnSave.onclick = function() {
            alert(`[Admin Action Logged]: Score na ${result.score}% ay matagumpay na pumasok sa database records!`);
            btnSave.disabled = true;
        };
    }
}