# AI workshop

## Prerequisites
- Postman (or other REST API client)
- node, npm
- Docker
- Configure and test the setup from `docker-compose.yml`
    - Clone this repository
    - Run `docker compose up -d` (in project directory)
    - Run `docker container ls --all` to check all 4 containers are up and healthy
    - Test `ollama`
         - Open <a href="http://localhost:11434/" target="_blank" rel="noopener noreferrer">http://localhost:11434/</a> - should print `Ollama is running`
         - Open <a href="http://localhost:11434/api/tags/" target="_blank" rel="noopener noreferrer">http://localhost:11434/api/tags/</a> - should print `{"models":[]}` - empty array as there are no models yet.
    - Download some models to `ollama`
        - Run `docker exec -it ollama ollama run gemma3:1b` (after running the command you should be able to chat via command line)
        - Run `docker exec -it ollama ollama run qwen3:1.7b` (as this one is a bit smarter than gemma3:1b)
        - You can download more models as well. Check available LLMs here: https://ollama.com/library
        - Recommended small (~2GB) LLMs (as of November, 2025): gemma3, qwen3, phi4-mini-reasoning, granite4.
        - After installation, you can check if the model is available via API - http://localhost:11434/api/tags (should contain info about model within JSON body).
    - Test `ollama` LLM via REST API - should be working fine:
        ```
        POST /api/generate HTTP/1.1
        Host: localhost:11434
        Content-Type: application/json

        {
            "model": "gemma3:1b",
            "prompt": "Why do cats have tails?",
            "stream": false,
            "options": {
                "temperature": 0.2
            }
        }
        ```
    - Test `anythingllm`
        - Open <a href="http://localhost:3001/" target="_blank" rel="noopener noreferrer">http://localhost:3001/</a> - should open pretty web app UI
        - Create a workspace, try chatting a little, should work fine.
        - In case of `Error: No Ollama Base Path was set.` - check Settings > AI Providers > LLM > Advanced Settings > Ollama Base URL - should point to `http://ollama:11434`.
        - In case of `LanceDB::Invalid ENV settings` - check Settings > AI Providers > Vector Database - re-select LanceDB and save changes - that should regenerate proper env settings.
    - Test `openwebui`
        - Open <a href="http://localhost:3000/" target="_blank" rel="noopener noreferrer">http://localhost:3000/</a> - should open pretty web app UI
        - Try chatting a little, should work fine.
        - In case of connection issues, check User > Admin Panel > Settings > Connections > Ollama API - should point to `http://ollama:11434`.
    - Test `n8n`
        - Open <a href="http://localhost:5678/" target="_blank" rel="noopener noreferrer">http://localhost:5678/</a> - should open pretty web app UI
        - Proceed with sample user creation (email, name, surname, password) - one time thing
        - Optional: try creating simple chatbot workflow from example, connect ollama model, try chatting via chat interface, should work fine.
- Configure and test `sft-admission-automation-llm` and `literature-critic-llm` sample project
    - Open project directory (`cd <directory>`)
    - Run `npm install` to pull dependencies.
    - Run `npm run start` to test the script - it should work fine together with ollama and gemma3:1b or qwen3:1.7b - it should start printing the results in terminal.