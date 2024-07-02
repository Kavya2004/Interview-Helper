import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import fs from "fs";
import { fileURLToPath } from 'url';
import path from "path";

const app = express();

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cors());
app.set("view engine", "ejs");

const port = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const questionsFilePath = path.join(__dirname, "./questions.json");
const questions = JSON.parse(fs.readFileSync(questionsFilePath, 'utf-8'));

app.get("/", (req, res) => {
    const jobTitles = Object.keys(questions);
    res.render("index.ejs", { title: 'Home Page' , jobTitles});
});

app.get('/help', (req, res) => {
    res.render('help.ejs', { title: 'Help Page' });
  });

  app.get('/about', (req, res) => {
    res.render('about.ejs', { title: 'About Page' });
  });

app.get('/api/questions/:jobTitle', (req, res) => {
    const jobTitle = req.params.jobTitle;
    const jobQuestions = questions[jobTitle];
    if (jobQuestions) {
      res.json(jobQuestions);
    } else {
      res.status(404).json({ message: 'Job title not found' });
    }
});

function evaluateAnswer(ans){
    const SituationKeywords = ["situation", "context", "background", "location"];
    const TaskKeywords = ["task", "role", "responsibility", "duty", "leadership", "challenge"];
    const ActionKeywords = ["action", "steps", "approach", "advancement", "technique"];
    const ResultKeywords = ["result", "outcome", "consequence", "ultimately", "lead"];

    const ContainsKeyword = (keywords, text) => keywords.some(keyword => text.toLowerCase().includes(keyword));

    const HasSituation = ContainsKeyword(SituationKeywords, ans);
    const HasTask = ContainsKeyword(TaskKeywords, ans);
    const HasAction = ContainsKeyword(ActionKeywords, ans);
    const HasResult = ContainsKeyword(ResultKeywords, ans);

    let feedback = "";

    if (!HasSituation) {
        feedback += "Include situation or context in your answer. ";
    }
    if (!HasTask) {
        feedback += "Include the task you were assigned or the challenge you encountered in your answer. ";
    }
    if (!HasAction) {
        feedback += "Include action or steps you took to complete the assigned task in your answer. ";
    }
    if (!HasResult) {
        feedback += "Include the result or outcome of your action in your answer. ";
    }
    if (HasSituation && HasTask && HasAction && HasResult){
        feedback += "Well Done! Your answer covers all the STAR (Situation Task Action Result) Components. "
    }
    
    return feedback;
}

app.post('/api/submitAnswer', (req, res) => {
  const { ans } = req.body;
  const feedback = evaluateAnswer(ans);
  res.json({ feedback });
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
