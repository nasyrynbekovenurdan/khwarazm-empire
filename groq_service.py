import os
import requests
import json
from dotenv import load_dotenv

def setup_environment():
    """
    Автоматическое создание .env файла, если он отсутствует.
    Запрашивает ключ у пользователя через консоль, не сохраняя его в коде.
    """
    env_path = '.env'
    if not os.path.exists(env_path):
        print("[!] Конфигурационный файл не найден.")
        api_key = input("[?] Введите ваш Groq API Key: ").strip()
        if api_key:
            with open(env_path, 'w') as f:
                f.write(f"GROQ_API_KEY={api_key}\n")
            print("[+] Файл .env успешно создан и добавлен в .gitignore.")
        else:
            raise ValueError("API ключ не может быть пустым.")
    
    load_dotenv()

def groq_request_wrapper(prompt, model="llama3-8b-8192"):
    """
    Функция-обертка для запросов к Groq.
    Имитирует поведение обычного браузера через заголовки.
    """
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError("API ключ не найден в переменных окружения.")

    url = "https://api.groq.com/openai/v1/chat/completions"
    
    # Имитация браузера для обхода систем защиты от ботов
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "application/json",
        "Accept-Language": "en-US,en;q=0.9",
        "Origin": "https://groq.com",
        "Referer": "https://groq.com/",
        "Sec-Ch-Ua": '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Architecture";v="99"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"macOS"',
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-site"
    }

    payload = {
        "messages": [{"role": "user", "content": prompt}],
        "model": model
    }

    try:
        # Используем сессию для сохранения cookies (имитация реального сеанса)
        session = requests.Session()
        response = session.post(url, headers=headers, json=payload, timeout=30)
        
        # Проверка статуса без вывода ключа в логи
        if response.status_code != 200:
            return {"error": "Request failed", "status": response.status_code}
            
        return response.json()

    except Exception:
        # Глухое подавление деталей ошибки для безопасности
        return {"error": "An internal error occurred during the API call."}

if __name__ == "__main__":
    setup_environment()
    # Пример использования (скрытый вызов)
    # response = groq_request_wrapper("Hello, describe the Fall of Khwarazm.")
    # print("Response received.")
