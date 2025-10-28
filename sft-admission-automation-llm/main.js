import { createReadStream, existsSync, writeFileSync, appendFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url'; // Import fileURLToPath for ES module compatibility
import csv from 'csv-parser';
import axios from 'axios';
import { log } from 'console';

const __dirname = dirname(fileURLToPath(import.meta.url));

const inputFilePath = join(__dirname, 'input.csv');
const inputQuestionsFilePath = join(__dirname, 'questions.csv');
const inputCriteriaFilePath = join(__dirname, 'criteria.csv');
const outputFilePath = join(__dirname, 'output.csv');
const logFilePath = join(__dirname, 'log.csv');

async function getAnswerEvaluationResponse(question, criteria, answer, shouldPrintResponse = false) {
    return new Promise((resolve, reject) => {
        axios.post('http://localhost:11434/api/generate', {
            //model: "deepseek-r1:1.5b", //this is bad.
            model: "gemma3:1b",
            //model: "qwen3:1.7b",
            //model: "phi4-mini-reasoning:latest",
            prompt: `# Identity\n
            Act as a computer that evaluates candidates to academy for software testers. 
            Do not require testing knowledge - focus on finding out if the candidate is smart, has analytical skills, critical thinking,
            and if they have a potential to become a software test engineer.\n\n
            # Question to the candidate\n
            ${question}.\n\n
            # Evaluation criteria\n
            ${criteria}\n\n
            # Answer provided by the candidate\n
            ${answer}\n\n
            # Task\n
            Please start the response with an evaluation score (in range from 0 to 10, with 0 meaning no criteria were met, and 10 meaning all the criteria were met),
            and explain your decision - which evaluation criteria were met, which were not, and how that end score was calculated based on criteria.`,
            stream: false,
            think: false,
            format: {
                "type": "object",
                "properties": {
                    "score": {
                        "type": "number",
                        "description": "The score value (e.g., between 0 and 10)"
                    },
                    // "explanation": {
                    //     "type": "string",
                    //     "description": "A detailed explanation in respect to all the evaluation criteria"
                    // }
                },
                "required": [
                    "score",
                    //"explanation"
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

async function readQuestionsFile() {
    let questions = [];

    return new Promise((resolve, reject) => {
        createReadStream(inputQuestionsFilePath)
            .pipe(csv())
            .on('data', (row) => {
                questions.push(row.Question1);
                questions.push(row.Question2);
                questions.push(row.Question3);
                questions.push(row.Question4);
            })
            .on('end', () => {
                console.log('Questions file successfully processed.');
                resolve(questions);
            })
            .on('error', (err) => {
                console.error('Error reading the file:', err);
                reject(err);
            });
    });
}

async function readCriteriaFile() {
    let criteria = [];

    return new Promise((resolve, reject) => {
        createReadStream(inputCriteriaFilePath)
            .pipe(csv())
            .on('data', (row) => {
                criteria.push(row.Criteria1);
                criteria.push(row.Criteria2);
                criteria.push(row.Criteria3);
                criteria.push(row.Criteria4);
            })
            .on('end', () => {
                console.log('Criteria file successfully processed.');
                resolve(criteria);
            })
            .on('error', (err) => {
                console.error('Error reading the file:', err);
                reject(err);
            });
    });
}

async function readInputFile() {
    let inputRows = [];

    return new Promise((resolve, reject) => {
        createReadStream(inputFilePath)
            .pipe(csv())
            .on('data', (row) => {
                inputRows.push(row);
            })
            .on('end', () => {
                console.log('Input file successfully processed.');
                resolve(inputRows);
            })
            .on('error', (err) => {
                console.error('Error reading the file:', err);
                reject(err);
            });
    });
}

async function main() {
    let questions = await readQuestionsFile();
    console.log('Questions read: ', questions.length);

    let criteria = await readCriteriaFile();
    console.log('Criteria read: ', criteria.length);

    let inputRows = await readInputFile();
    console.log('Input rows read: ', inputRows.length);
    console.log('Evaluating candidates...');

    // Check if the output file exists, if not, create it and add headers
    if (!existsSync(outputFilePath)) {
        writeFileSync(outputFilePath, 'Name,Score1,Score2,Score3,Score4,TotalScore\n');
    }

    // Check if the log file exists, if not, create it and add headers
    if (!existsSync(logFilePath)) {
        writeFileSync(logFilePath, 'Name,Question,Answer,Score,Explanaition\n');
    }

    for (const inputRow of inputRows) {
        const candidate = inputRow[Object.keys(inputRow)[0]];
        let score1 = 0;
        let response1 = { explanation: "No answer provided." };
        if (inputRow.Answer1 !== 'NULL' && inputRow.Answer1.trim() !== '') {
            response1 = await getAnswerEvaluationResponse(questions[0], criteria[0], inputRow.Answer1);
            score1 = response1.score * 0.4;
        }
        let logRow1 = `"${candidate}","${questions[0]}","${inputRow.Answer1}","${score1.toFixed(1)}","${response1.explanation}"\n`;
        appendFileSync(logFilePath, logRow1);

        let score2 = 0;
        let response2 = { explanation: "No answer provided." };
        if (inputRow.Answer2 !== 'NULL' && inputRow.Answer2.trim() !== '') {
            response2 = await getAnswerEvaluationResponse(questions[1], criteria[1], inputRow.Answer2);
            score2 = response2.score * 0.2;
        }
        let logRow2 = `"${candidate}","${questions[1]}","${inputRow.Answer2}","${score2.toFixed(1)}","${response2.explanation}"\n`;
        appendFileSync(logFilePath, logRow2);

        let score3 = 0;
        let response3 = { explanation: "No answer provided." };
        if (inputRow.Answer3 !== 'NULL' && inputRow.Answer3.trim() !== '') {
            response3 = await getAnswerEvaluationResponse(questions[2], criteria[2], inputRow.Answer3);
            score3 = response3.score * 0.2;
        }
        let logRow3 = `"${candidate}","${questions[2]}","${inputRow.Answer3}","${score3.toFixed(1)}","${response3.explanation}"\n`;
        appendFileSync(logFilePath, logRow3);

        let score4 = 0;
        let response4 = { explanation: "No answer provided." };
        if (inputRow.Answer4 !== 'NULL' && inputRow.Answer4.trim() !== '') {
            response4 = await getAnswerEvaluationResponse(questions[3], criteria[3], inputRow.Answer4);
            score4 = response4.score * 0.2;
        }
        let logRow4 = `"${candidate}","${questions[3]}","${inputRow.Answer4}","${score4.toFixed(1)}","${response4.explanation}"\n`;
        appendFileSync(logFilePath, logRow4);

        let totalScore = score1 + score2 + score3 + score4;
        
        let outputRow = `${candidate},${score1.toFixed(1)},${score2.toFixed(1)},${score3.toFixed(1)},${score4.toFixed(1)},${totalScore.toFixed(1)}\n`;
    
        // Append the row to the output file
        appendFileSync(outputFilePath, outputRow);

        console.log(`${candidate.padEnd(30, ' ')}Score1(Motivation)=${score1.toFixed(1)}, Score2(Decision)=${score2.toFixed(1)}, Score3(Vehicle park)=${score3.toFixed(1)}, Score4(Broken lock)=${score4.toFixed(1)}, TotalScore=${totalScore.toFixed(1)}`);
    }

    console.log('All candidates evaluated. Results saved to output.csv.');
}

main();