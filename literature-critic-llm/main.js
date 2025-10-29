import { createReadStream, existsSync, writeFileSync, appendFileSync } from 'fs';
import csv from 'csv-parser';
import axios from 'axios';

async function getAnswerEvaluationResponse(criteria, text, shouldPrintResponse = false) {
    return new Promise((resolve, reject) => {
        axios.post('http://localhost:11434/api/generate', {
            //model: "deepseek-r1:1.5b", //this is bad.
            //model: "gemma3:1b",
            model: "qwen3:1.7b",
            //model: "phi4-mini-reasoning:latest",
            prompt: `# Identity\n
            Act as a literature critic system that evaluates pieces of writen art based of the given criteria.\n\n
            # Piece of art\n
            ${text}.\n\n
            # Evaluation criteria\n
            ${criteria}\n\n
            # Task\n
            Please evaluate given piece of art based on the described criteria and give evaluation score (0-10).`,
            stream: false,
            think: false,
            format: {
                "type": "object",
                "properties": {
                    "score": {
                        "type": "number",
                        "description": "The score value (between 0 and 10) based if you think this piece of art meets the criteria."
                    }
                },
                "required": [
                    "score"
                ]
            },
            options: {
                "temperature": 0.1
            }
        })
        .then(response => {
            try {
                if (shouldPrintResponse) {
                    console.log('API response:', response.data.response);
                }
                const parsedResponse = JSON.parse(response.data.response);
                resolve(parsedResponse);
            } catch (error) {
                console.error('Error parsing API response:', error);
                resolve(null);
            }
        })
        .catch(error => {
            console.error('Error making API request:', error);
            resolve(null);
        });
    });
}

async function main() {

    const evaluationCriteria = [
        "Clarity of expression",
        "Coherence and logical flow",
        "Grammar and mechanics",
        "Vocabulary and style",
        "Originality and creativity",
        "Relevance to the prompt or topic",
        "Depth of insight and analysis",
        "Argument strength and use of evidence",
        "Conciseness and focus (no unnecessary filler)",
        "Readability and accessibility for target audience",
        "Engagement and emotional impact",
        "Appropriate tone and voice",
        "Structure and organization (intro, body, conclusion)",
        "Factual accuracy and reliability",
        "Proper attribution and citations when needed",
        "Ethical/safety considerations (no harmful content)",
        "Formatting and presentation",
        "Effective call-to-action or takeaway (if applicable)"
    ];

    const text = "Bugs are like Scooby-Doo villains—always hiding behind a mask until testing pulls it off. 🐾💻 Don’t let your code be a haunted house—run your tests, chase those bugs, and let your inner Velma shine! 🔍 Join the mystery squad and test smarter today."

    const evaluationResults = [];

    for (const criteria of evaluationCriteria) {
        const evaluationResponse = await getAnswerEvaluationResponse(criteria, text, false);
        const score = evaluationResponse.score;
        evaluationResults.push({ score });
        console.log(`Score (${score}) for criteria: ${criteria}`);
    }

    const totalScore = evaluationResults.reduce((sum, result) => sum + result.score, 0) / evaluationResults.length * 10;
    console.log(`\nOverall Score: ${totalScore.toFixed(2)}%`);
}

main();