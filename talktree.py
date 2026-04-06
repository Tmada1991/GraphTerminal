import requests
import json

url = "https://api.dify.ai/v1/chat-messages"

headers = {
    "Authorization": "Bearer YOUR_DIFY_API_KEY", # ※あなたの実際のAPIキー
    "Content-Type": "application/json"
}

# 2回目のリクエストデータ（状態の引き継ぎと深掘り）
data = {
    "inputs": {
        "target_topic": "AIの歴史" # ★必須変数のため、初回と同じ値を再度指定します
    },
    "query": "第1次AIブーム（探索と推論）",
    "response_mode": "blocking",
    "conversation_id": "719cc4f5-d148-4b93-b852-34580311049d",
    "user": "test_user_01"
}

response = requests.post(url, headers=headers, json=data)

print("ステータスコード:", response.status_code)
if response.status_code == 200:
    print("レスポンス全体:\n", json.dumps(response.json(), indent=2, ensure_ascii=False))
else:
    print("エラー内容:\n", response.text)