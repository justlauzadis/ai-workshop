# AI workshop

## Prerequisites
- Postman (or other REST API client)
- node, npm
- Docker
- Configure and test the setup from `docker-compose.yml`
    - Clone this repository
    - **Important for Macbook users:** setup part is different on Macbooks (uses local ollama instead of docker container)
        - **Additional steps for Macbook users:**
        - Install ollama locally: `brew install ollama`
        - Start ollama: `ollama serve`
        - Run (and download) models: `ollama run gemma3:1b`
        - And another one: `ollama run qwen3:1.7b`
    - Change directory to a respective directory with docker compose file
        - MacOS: `cd _docker-compose-for-mac-os`
        - Windows: `cd _docker-compose-for-win`
    - Run `docker compose up -d`
    - Run `docker container ls --all` to check all containers are up and healthy (on Macbook, should list 3 containers, on Windows - 4)
    - Test `ollama`
         - Open <a href="http://localhost:11434/" target="_blank" rel="noopener noreferrer">http://localhost:11434/</a> - should print `Ollama is running`
    - **On Windows:** Download some models to `ollama` container (or at least the following 2 models)
        - Run `docker exec -it ollama ollama run gemma3:1b` (after running the command you should be able to chat via command line)
        - Run `docker exec -it ollama ollama run qwen3:1.7b` (as this one is a bit smarter than gemma3:1b)
            - In case of `tls: failed to verify certificate: x509: certificate signed by unknown authority` - enable VPN.
        - You can download more models as well. Check available LLMs here: https://ollama.com/library
        - Recommended small (~2GB) LLMs (as of November, 2025): gemma3, qwen3, phi4-mini-reasoning, granite4.
        - After installation, you can check if the model is available via API - http://localhost:11434/api/tags (should contain info about model within JSON body).
    - Test `ollama` LLM via REST API - should be working fine (on both Windows and MacOS):
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
- Configure and test `sft-admission-automation-llm` and `literature-critic-llm` sample project
    - Open project directory (`cd <directory>`)
    - Run `npm install` to pull dependencies.
    - Run `npm run start` to test the script - it should work fine together with ollama and gemma3:1b or qwen3:1.7b - it should start printing the results in terminal.